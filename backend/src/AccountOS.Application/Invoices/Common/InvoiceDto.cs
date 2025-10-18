using AccountOS.Domain.Enums;

namespace AccountOS.Application.Invoices.Common;

/// <summary>
/// Fatura DTO'su
/// </summary>
public class InvoiceDto
{
    /// <summary>Fatura ID</summary>
    public Guid Id { get; set; }
    
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; set; }
    
    /// <summary>Fatura numarası</summary>
    public string InvoiceNumber { get; set; } = string.Empty;
    
    /// <summary>Fatura tipi</summary>
    public InvoiceType Type { get; set; }
    
    /// <summary>Fatura tipi adı</summary>
    public string TypeName { get; set; } = string.Empty;
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; set; }
    
    /// <summary>Cari hesap adı</summary>
    public string CustomerName { get; set; } = string.Empty;
    
    /// <summary>Cari hesap kodu</summary>
    public string CustomerCode { get; set; } = string.Empty;
    
    /// <summary>Fatura tarihi</summary>
    public DateTime InvoiceDate { get; set; }
    
    /// <summary>Vade tarihi</summary>
    public DateTime? DueDate { get; set; }
    
    /// <summary>Fatura para birimi</summary>
    public string Currency { get; set; } = string.Empty;
    
    /// <summary>Döviz kuru</summary>
    public decimal ExchangeRate { get; set; }
    
    /// <summary>Ana para birimi</summary>
    public string BaseCurrency { get; set; } = string.Empty;
    
    /// <summary>Ara toplam</summary>
    public decimal SubTotal { get; set; }
    
    /// <summary>KDV toplamı</summary>
    public decimal VatTotal { get; set; }
    
    /// <summary>Genel toplam</summary>
    public decimal GrandTotal { get; set; }
    
    /// <summary>Ana para biriminde genel toplam</summary>
    public decimal GrandTotalInBase { get; set; }
    
    /// <summary>Ödenen tutar</summary>
    public decimal PaidAmount { get; set; }
    
    /// <summary>Kalan tutar</summary>
    public decimal RemainingAmount { get; set; }
    
    /// <summary>Fatura durumu</summary>
    public InvoiceStatus Status { get; set; }
    
    /// <summary>Fatura durumu adı</summary>
    public string StatusName { get; set; } = string.Empty;
    
    /// <summary>Notlar</summary>
    public string? Notes { get; set; }
    
    /// <summary>Fatura kalemleri</summary>
    public List<InvoiceItemDto> Items { get; set; } = new();
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; set; }
}
