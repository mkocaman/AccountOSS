using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Invoices.Commands.IssueInvoice;

/// <summary>
/// Fatura kesme komut işleyicisi
/// </summary>
public class IssueInvoiceCommandHandler : IRequestHandler<IssueInvoiceCommand, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IStockService _stockService;

    public IssueInvoiceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IStockService stockService)
    {
        _context = context;
        _currentUser = currentUser;
        _stockService = stockService;
    }

    public async Task<Result<InvoiceDto>> Handle(IssueInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<InvoiceDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Faturayı getir
        var invoice = await _context.Invoices
            .Include(i => i.Items)
                .ThenInclude(ii => ii.Product)
            .Where(i => i.Id == request.InvoiceId && i.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Fail("Fatura bulunamadı");

        // Sadece Draft durumdaki faturalar kesilebilir
        if (invoice.Status != InvoiceStatus.Draft)
            return Result<InvoiceDto>.Fail($"Sadece taslak faturalar kesilebilir. Mevcut durum: {invoice.Status}");

        // Stok hareketlerini uygula
        foreach (var item in invoice.Items)
        {
            if (!item.Product.TrackStock)
                continue; // Stok takipsiz ürünler için işlem yapma

            if (invoice.Type == InvoiceType.Sales)
            {
                // Satış faturası → Stok düş (FIFO)
                try
                {
                    await _stockService.RemoveStockAsync(
                        item.ProductId,
                        item.Quantity,
                        "Invoice",
                        invoice.Id,
                        cancellationToken);
                }
                catch (InvalidOperationException ex)
                {
                    return Result<InvoiceDto>.Fail($"Stok düşülemedi: {ex.Message}");
                }
            }
            else if (invoice.Type == InvoiceType.Purchase)
            {
                // Alış faturası → Stok artır
                await _stockService.AddStockAsync(
                    item.ProductId,
                    item.Quantity,
                    item.UnitPrice,
                    invoice.Currency,
                    "Invoice",
                    invoice.Id,
                    cancellationToken);
            }
        }

        // Fatura durumunu güncelle
        invoice.Status = InvoiceStatus.Issued;
        invoice.UpdatedAt = DateTime.UtcNow;
        invoice.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = await MapToDtoAsync(invoice, cancellationToken);

        return Result<InvoiceDto>.Ok(dto);
    }

    private async Task<InvoiceDto> MapToDtoAsync(Domain.Entities.Invoice invoice, CancellationToken cancellationToken)
    {
        var customer = await _context.Customers
            .Where(c => c.Id == invoice.CustomerId)
            .FirstOrDefaultAsync(cancellationToken);

        return new InvoiceDto
        {
            Id = invoice.Id,
            CompanyId = invoice.CompanyId,
            InvoiceNumber = invoice.InvoiceNumber,
            Type = invoice.Type,
            TypeName = invoice.Type == InvoiceType.Sales ? "Satış" : "Alış",
            CustomerId = invoice.CustomerId,
            CustomerName = customer?.Name ?? "",
            CustomerCode = customer?.Code ?? "",
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
