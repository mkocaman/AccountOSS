using AccountOS.Application.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Invoices.Queries.GetInvoices;

/// <summary>
/// Faturaları listele
/// </summary>
public record GetInvoicesQuery : IRequest<Result<List<InvoiceDto>>>
{
    /// <summary>Fatura tipi filtresi</summary>
    public InvoiceType? Type { get; init; }
    
    /// <summary>Cari hesap ID filtresi</summary>
    public Guid? CustomerId { get; init; }
    
    /// <summary>Durum filtresi</summary>
    public InvoiceStatus? Status { get; init; }
    
    /// <summary>Başlangıç tarihi</summary>
    public DateTime? StartDate { get; init; }
    
    /// <summary>Bitiş tarihi</summary>
    public DateTime? EndDate { get; init; }
    
    /// <summary>Arama terimi (fatura no, cari adı)</summary>
    public string? SearchTerm { get; init; }
}
