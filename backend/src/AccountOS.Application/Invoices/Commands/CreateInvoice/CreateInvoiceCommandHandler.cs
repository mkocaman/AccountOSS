using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Invoices.Commands.CreateInvoice;

/// <summary>
/// Fatura oluşturma komut işleyicisi
/// </summary>
public class CreateInvoiceCommandHandler : IRequestHandler<CreateInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IStockService _stockService;
    private readonly IDocumentNumberingService _numberingService;

    public CreateInvoiceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IStockService stockService,
        IDocumentNumberingService numberingService)
    {
        _context = context;
        _currentUser = currentUser;
        _stockService = stockService;
        _numberingService = numberingService;
    }

    public async Task<Result<InvoiceDto>> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<InvoiceDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Şirket bilgilerini getir
        var company = await _context.Companies
            .Where(c => c.Id == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (company == null)
            return Result<InvoiceDto>.Fail("Şirket bulunamadı");

        // Cari hesap kontrolü
        var customer = await _context.Customers
            .Where(c => c.Id == request.CustomerId && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<InvoiceDto>.Fail("Cari hesap bulunamadı");

        // Kalem kontrolü
        if (request.Items == null || !request.Items.Any())
            return Result<InvoiceDto>.Fail("Fatura en az 1 kalem içermelidir");

        // Otomatik fatura numarası oluştur (template-based)
        var invoiceNumber = await _numberingService.GenerateNumberAsync(
            "Invoice",
            request.Type == InvoiceType.Sales ? "Sales" : "Purchase",
            request.InvoiceDate,
            cancellationToken);

        // Kur hesapla (multi-currency)
        var baseCurrency = company.BaseCurrency;
        decimal exchangeRate = 1m;

        if (request.Currency != baseCurrency)
        {
            // Kur getir (FxRate'ten - basitleştirilmiş)
            var fxRate = await _context.FxRates
                .Where(r => r.BaseCurrencyCode == request.Currency 
                         && r.QuoteCurrencyCode == baseCurrency
                         && r.EffectiveDate <= request.InvoiceDate)
                .OrderByDescending(r => r.EffectiveDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (fxRate != null)
                exchangeRate = fxRate.Rate;
        }

        // Yeni fatura oluştur
        var invoice = new Invoice
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            InvoiceNumber = invoiceNumber,
            Type = request.Type,
            CustomerId = request.CustomerId,
            InvoiceDate = request.InvoiceDate,
            DueDate = request.DueDate,
            Currency = request.Currency,
            ExchangeRate = exchangeRate,
            BaseCurrency = baseCurrency,
            Status = InvoiceStatus.Draft,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        // Fatura kalemlerini oluştur
        var lineNumber = 1;
        decimal subTotal = 0;
        decimal vatTotal = 0;

        foreach (var itemInput in request.Items)
        {
            // Ürün bilgilerini getir
            var product = await _context.Products
                .Where(p => p.Id == itemInput.ProductId && p.CompanyId == companyId)
                .FirstOrDefaultAsync(cancellationToken);

            if (product == null)
                return Result<InvoiceDto>.Fail($"Ürün bulunamadı: {itemInput.ProductId}");

            // Satış faturası için stok kontrolü
            if (request.Type == InvoiceType.Sales && product.TrackStock)
            {
                var availableStock = await _stockService.CalculateStockQuantityAsync(
                    product.Id, 
                    cancellationToken);

                if (availableStock < itemInput.Quantity)
                {
                    return Result<InvoiceDto>.Fail(
                        $"Yetersiz stok! Ürün: {product.Name}, Mevcut: {availableStock}, İstenen: {itemInput.Quantity}");
                }
            }

            // Hesaplamalar
            var itemSubTotal = itemInput.Quantity * itemInput.UnitPrice;
            var discountAmount = itemSubTotal * (itemInput.DiscountPercentage / 100);
            var itemSubTotalAfterDiscount = itemSubTotal - discountAmount;
            var itemVatAmount = itemSubTotalAfterDiscount * (product.VatRate / 100);
            var itemTotal = itemSubTotalAfterDiscount + itemVatAmount;

            // FIFO maliyet hesapla (satış faturaları için)
            decimal? fifoCost = null;
            if (request.Type == InvoiceType.Sales && product.TrackStock)
            {
                fifoCost = await _stockService.CalculateFifoCostAsync(
                    product.Id,
                    itemInput.Quantity,
                    cancellationToken);
            }

            var invoiceItem = new InvoiceItem
            {
                Id = Guid.NewGuid(),
                InvoiceId = invoice.Id,
                ProductId = product.Id,
                LineNumber = lineNumber++,
                ProductName = product.Name,
                ProductCode = product.Code,
                Description = itemInput.Description,
                Quantity = itemInput.Quantity,
                Unit = product.Unit,
                UnitPrice = itemInput.UnitPrice,
                DiscountPercentage = itemInput.DiscountPercentage,
                DiscountAmount = discountAmount,
                VatRate = product.VatRate,
                SubTotal = itemSubTotalAfterDiscount,
                VatAmount = itemVatAmount,
                Total = itemTotal,
                FifoCost = fifoCost,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            invoice.Items.Add(invoiceItem);

            subTotal += itemSubTotalAfterDiscount;
            vatTotal += itemVatAmount;
        }

        // Fatura toplamları
        invoice.SubTotal = subTotal;
        invoice.VatTotal = vatTotal;
        invoice.GrandTotal = subTotal + vatTotal;
        invoice.GrandTotalInBase = invoice.GrandTotal * exchangeRate;
        invoice.PaidAmount = 0;
        invoice.RemainingAmount = invoice.GrandTotal;

        _context.Invoices.Add(invoice);
        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = await MapToDtoAsync(invoice.Id, cancellationToken);

        return Result<InvoiceDto>.Ok(dto!);
    }

    private async Task<InvoiceDto?> MapToDtoAsync(Guid invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.Id == invoiceId)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null)
            return null;

        return new InvoiceDto
        {
            Id = invoice.Id,
            CompanyId = invoice.CompanyId,
            InvoiceNumber = invoice.InvoiceNumber,
            Type = invoice.Type,
            TypeName = invoice.Type == InvoiceType.Sales ? "Satış" : "Alış",
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer.Name,
            CustomerCode = invoice.Customer.Code,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Currency = invoice.Currency,
            ExchangeRate = invoice.ExchangeRate,
            BaseCurrency = invoice.BaseCurrency,
            SubTotal = invoice.SubTotal,
            VatTotal = invoice.VatTotal,
            GrandTotal = invoice.GrandTotal,
            GrandTotalInBase = invoice.GrandTotalInBase,
            PaidAmount = invoice.PaidAmount,
            RemainingAmount = invoice.RemainingAmount,
            Status = invoice.Status,
            StatusName = GetStatusName(invoice.Status),
            Notes = invoice.Notes,
            Items = invoice.Items.OrderBy(i => i.LineNumber).Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                LineNumber = i.LineNumber,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductCode = i.ProductCode,
                Description = i.Description,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                DiscountPercentage = i.DiscountPercentage,
                DiscountAmount = i.DiscountAmount,
                VatRate = i.VatRate,
                SubTotal = i.SubTotal,
                VatAmount = i.VatAmount,
                Total = i.Total,
                FifoCost = i.FifoCost
            }).ToList(),
            CreatedAt = invoice.CreatedAt
        };
    }

    private static string GetStatusName(InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "Taslak",
            InvoiceStatus.Issued => "Kesildi",
            InvoiceStatus.PartiallyPaid => "Kısmi Ödendi",
            InvoiceStatus.Paid => "Ödendi",
            InvoiceStatus.Overdue => "Vadesi Geçti",
            InvoiceStatus.Cancelled => "İptal",
            _ => status.ToString()
        };
    }
}
