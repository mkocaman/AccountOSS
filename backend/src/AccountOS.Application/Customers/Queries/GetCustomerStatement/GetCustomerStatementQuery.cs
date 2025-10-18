using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using MediatR;

namespace AccountOS.Application.Customers.Queries.GetCustomerStatement;

/// <summary>
/// Cari hesap ekstresi getir
/// </summary>
public record GetCustomerStatementQuery : IRequest<Result<CustomerStatementDto>>
{
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; init; }
    
    /// <summary>Başlangıç tarihi</summary>
    public DateTime StartDate { get; init; }
    
    /// <summary>Bitiş tarihi</summary>
    public DateTime EndDate { get; init; }
    
    /// <summary>Fatura isimlerini göster</summary>
    public bool ShowInvoiceNames { get; init; } = true;
    
    /// <summary>Ürün/hizmet kalemlerini göster</summary>
    public bool ShowItems { get; init; } = false;
    
    /// <summary>Banka bilgilerini göster</summary>
    public bool ShowBankAccounts { get; init; } = true;
    
    /// <summary>Para birimleri (TRY, USD, EUR)</summary>
    public List<string> Currencies { get; init; } = new() { "TRY" };
}

