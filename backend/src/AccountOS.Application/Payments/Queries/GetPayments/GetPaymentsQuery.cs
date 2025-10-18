using AccountOS.Application.Common;
using AccountOS.Application.Payments.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Payments.Queries.GetPayments;

/// <summary>
/// Ödemeleri listele
/// </summary>
public record GetPaymentsQuery : IRequest<Result<List<PaymentDto>>>
{
    /// <summary>Ödeme tipi filtresi</summary>
    public PaymentType? Type { get; init; }
    
    /// <summary>Cari hesap ID filtresi</summary>
    public Guid? CustomerId { get; init; }
    
    /// <summary>Fatura ID filtresi</summary>
    public Guid? InvoiceId { get; init; }
    
    /// <summary>Ödeme yöntemi filtresi</summary>
    public PaymentMethod? Method { get; init; }
    
    /// <summary>Başlangıç tarihi</summary>
    public DateTime? StartDate { get; init; }
    
    /// <summary>Bitiş tarihi</summary>
    public DateTime? EndDate { get; init; }
    
    /// <summary>Arama terimi</summary>
    public string? SearchTerm { get; init; }
}

