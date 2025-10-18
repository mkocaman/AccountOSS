using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Payments.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Ödeme kaydetme komut işleyicisi
/// </summary>
public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, Result<PaymentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDocumentNumberingService _numberingService;

    public CreatePaymentCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDocumentNumberingService numberingService)
    {
        _context = context;
        _currentUser = currentUser;
        _numberingService = numberingService;
    }

    public async Task<Result<PaymentDto>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<PaymentDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Şirket bilgilerini getir
        var company = await _context.Companies
            .Where(c => c.Id == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (company == null)
            return Result<PaymentDto>.Fail("Şirket bulunamadı");

        // Cari hesap kontrolü
        var customer = await _context.Customers
            .Where(c => c.Id == request.CustomerId && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<PaymentDto>.Fail("Cari hesap bulunamadı");

        // Fatura kontrolü (opsiyonel)
        Invoice? invoice = null;
        if (request.InvoiceId.HasValue)
        {
            invoice = await _context.Invoices
                .Where(i => i.Id == request.InvoiceId.Value 
                         && i.CompanyId == companyId
                         && i.CustomerId == request.CustomerId)
                .FirstOrDefaultAsync(cancellationToken);

            if (invoice == null)
                return Result<PaymentDto>.Fail("Fatura bulunamadı veya bu cari hesaba ait değil");

            // Ödeme fatura tutarını aşmamalı
            var remainingAmount = invoice.RemainingAmount;
            if (request.Amount > remainingAmount)
                return Result<PaymentDto>.Fail(
                    $"Ödeme tutarı fatura kalan tutarını aşıyor. Kalan: {remainingAmount} {invoice.Currency}");
        }

        // Otomatik ödeme numarası oluştur (template-based)
        var paymentNumber = await _numberingService.GenerateNumberAsync(
            "Payment",
            null,
            request.PaymentDate,
            cancellationToken);

        // Kur hesapla (multi-currency)
        var baseCurrency = company.BaseCurrency;
        decimal exchangeRate = 1m;

        if (request.Currency != baseCurrency)
        {
            // Kur getir
            var fxRate = await _context.FxRates
                .Where(r => r.BaseCurrencyCode == request.Currency
                         && r.QuoteCurrencyCode == baseCurrency
                         && r.EffectiveDate <= request.PaymentDate)
                .OrderByDescending(r => r.EffectiveDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (fxRate != null)
                exchangeRate = fxRate.Rate;
        }

        // Yeni ödeme oluştur
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            PaymentNumber = paymentNumber,
            Type = request.Type,
            CustomerId = request.CustomerId,
            InvoiceId = request.InvoiceId,
            PaymentDate = request.PaymentDate,
            Method = request.Method,
            Amount = request.Amount,
            Currency = request.Currency,
            ExchangeRate = exchangeRate,
            BaseCurrency = baseCurrency,
            AmountInBase = request.Amount * exchangeRate,
            BankAccount = request.BankAccount,
            ReferenceNumber = request.ReferenceNumber,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Payments.Add(payment);

        // Fatura durumunu güncelle
        if (invoice != null)
        {
            invoice.PaidAmount += request.Amount;
            invoice.RemainingAmount = invoice.GrandTotal - invoice.PaidAmount;

            // Durum güncelle
            if (invoice.RemainingAmount <= 0)
            {
                invoice.Status = InvoiceStatus.Paid;
                invoice.RemainingAmount = 0; // Kesin 0 yap
            }
            else
            {
                invoice.Status = InvoiceStatus.PartiallyPaid;
            }

            invoice.UpdatedAt = DateTime.UtcNow;
            invoice.UpdatedBy = userId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = await MapToDtoAsync(payment.Id, cancellationToken);

        return Result<PaymentDto>.Ok(dto!);
    }

    private async Task<PaymentDto?> MapToDtoAsync(Guid paymentId, CancellationToken cancellationToken)
    {
        var payment = await _context.Payments
            .Include(p => p.Customer)
            .Include(p => p.Invoice)
            .Where(p => p.Id == paymentId)
            .FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return null;

        return new PaymentDto
        {
            Id = payment.Id,
            CompanyId = payment.CompanyId,
            PaymentNumber = payment.PaymentNumber,
            Type = payment.Type,
            TypeName = payment.Type == PaymentType.Receipt ? "Tahsilat" : "Ödeme",
            CustomerId = payment.CustomerId,
            CustomerName = payment.Customer.Name,
            CustomerCode = payment.Customer.Code,
            InvoiceId = payment.InvoiceId,
            InvoiceNumber = payment.Invoice?.InvoiceNumber,
            PaymentDate = payment.PaymentDate,
            Method = payment.Method,
            MethodName = GetMethodName(payment.Method),
            Amount = payment.Amount,
            Currency = payment.Currency,
            ExchangeRate = payment.ExchangeRate,
            BaseCurrency = payment.BaseCurrency,
            AmountInBase = payment.AmountInBase,
            BankAccount = payment.BankAccount,
            ReferenceNumber = payment.ReferenceNumber,
            Description = payment.Description,
            CreatedAt = payment.CreatedAt
        };
    }

    private static string GetMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.Cash => "Nakit",
            PaymentMethod.BankTransfer => "Banka Havalesi",
            PaymentMethod.CreditCard => "Kredi Kartı",
            PaymentMethod.Check => "Çek",
            PaymentMethod.PromissoryNote => "Senet",
            _ => method.ToString()
        };
    }
}

