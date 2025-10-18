using AccountOS.Application.Common;
using AccountOS.Application.Payments.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Ödeme kaydetme komutu
/// </summary>
public record CreatePaymentCommand : IRequest<Result<PaymentDto>>
{
    /// <summary>Ödeme tipi (Receipt/Payment)</summary>
    public PaymentType Type { get; init; }
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; init; }
    
    /// <summary>Fatura ID (opsiyonel - belirli faturaya bağlı ödeme)</summary>
    public Guid? InvoiceId { get; init; }
    
    /// <summary>Ödeme tarihi</summary>
    public DateTime PaymentDate { get; init; }
    
    /// <summary>Ödeme yöntemi</summary>
    public PaymentMethod Method { get; init; }
    
    /// <summary>Tutar</summary>
    public decimal Amount { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = "TRY";
    
    /// <summary>Banka hesabı (opsiyonel)</summary>
    public string? BankAccount { get; init; }
    
    /// <summary>Referans no (çek no, dekont no, vb.)</summary>
    public string? ReferenceNumber { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

