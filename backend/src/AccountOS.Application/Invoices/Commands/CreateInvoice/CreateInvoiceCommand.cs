using AccountOS.Application.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Invoices.Commands.CreateInvoice;

/// <summary>
/// Yeni fatura oluşturma komutu
/// </summary>
public record CreateInvoiceCommand : IRequest<Result<InvoiceDto>>
{
    /// <summary>Fatura tipi (Sales/Purchase)</summary>
    public InvoiceType Type { get; init; }
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; init; }
    
    /// <summary>Fatura tarihi</summary>
    public DateTime InvoiceDate { get; init; }
    
    /// <summary>Vade tarihi (opsiyonel)</summary>
    public DateTime? DueDate { get; init; }
    
    /// <summary>Fatura para birimi</summary>
    public string Currency { get; init; } = "TRY";
    
    /// <summary>Notlar</summary>
    public string? Notes { get; init; }
    
    /// <summary>Fatura kalemleri</summary>
    public List<CreateInvoiceItemInput> Items { get; init; } = new();
}

/// <summary>
/// Fatura kalemi giriş modeli
/// </summary>
public record CreateInvoiceItemInput
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; init; }
    
    /// <summary>Açıklama (opsiyonel)</summary>
    public string? Description { get; init; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; init; }
    
    /// <summary>Birim fiyat</summary>
    public decimal UnitPrice { get; init; }
    
    /// <summary>İndirim yüzdesi</summary>
    public decimal DiscountPercentage { get; init; }
}
