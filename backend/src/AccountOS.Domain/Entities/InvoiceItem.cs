using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Fatura kalemi entity'si
/// </summary>
public class InvoiceItem : BaseEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Fatura ID</summary>
    public Guid InvoiceId { get; set; }
    
    /// <summary>Fatura navigation property</summary>
    public virtual Invoice Invoice { get; set; } = null!;
    
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; set; }
    
    /// <summary>Ürün navigation property</summary>
    public virtual Product Product { get; set; } = null!;
    
    /// <summary>Satır numarası</summary>
    public int LineNumber { get; set; }
    
    /// <summary>Ürün adı (snapshot)</summary>
    public string ProductName { get; set; } = string.Empty;
    
    /// <summary>Ürün kodu (snapshot)</summary>
    public string ProductCode { get; set; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; set; }
    
    /// <summary>Birim</summary>
    public string Unit { get; set; } = string.Empty;
    
    /// <summary>Birim fiyat</summary>
    public decimal UnitPrice { get; set; }
    
    /// <summary>İndirim yüzdesi</summary>
    public decimal DiscountPercentage { get; set; }
    
    /// <summary>İndirim tutarı</summary>
    public decimal DiscountAmount { get; set; }
    
    /// <summary>KDV oranı</summary>
    public decimal VatRate { get; set; }
    
    /// <summary>Ara toplam (indirim sonrası)</summary>
    public decimal SubTotal { get; set; }
    
    /// <summary>KDV tutarı</summary>
    public decimal VatAmount { get; set; }
    
    /// <summary>Toplam (KDV dahil)</summary>
    public decimal Total { get; set; }
    
    /// <summary>FIFO maliyet (satış faturaları için)</summary>
    public decimal? FifoCost { get; set; }
    
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
