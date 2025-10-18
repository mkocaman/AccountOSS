using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Fatura entity'si (Alış/Satış)
/// </summary>
public class Invoice : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Fatura numarası (INV-2025-0001)</summary>
    public string InvoiceNumber { get; set; } = string.Empty;
    
    /// <summary>Fatura tipi (Sales/Purchase)</summary>
    public InvoiceType Type { get; set; }
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; set; }
    
    /// <summary>Cari hesap navigation property</summary>
    public virtual Customer Customer { get; set; } = null!;
    
    /// <summary>Fatura tarihi</summary>
    public DateTime InvoiceDate { get; set; }
    
    /// <summary>Vade tarihi</summary>
    public DateTime? DueDate { get; set; }
    
    /// <summary>Fatura para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Döviz kuru (snapshot)</summary>
    public decimal ExchangeRate { get; set; } = 1m;
    
    /// <summary>Ana para birimi</summary>
    public string BaseCurrency { get; set; } = "TRY";
    
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
    
    /// <summary>Notlar</summary>
    public string? Notes { get; set; }
    
    /// <summary>Fatura kalemleri</summary>
    public virtual ICollection<InvoiceItem> Items { get; set; } = new List<InvoiceItem>();
    
    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    
    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}
