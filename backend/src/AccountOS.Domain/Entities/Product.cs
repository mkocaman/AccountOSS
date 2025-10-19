using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Ürün/Hizmet entity
/// </summary>
public class Product : TenantEntity
{
    /// <summary>Ürün kodu (otomatik: P-0001)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Barkod</summary>
    public string? Barcode { get; set; }
    
    /// <summary>Ürün tipi (Mal/Hizmet)</summary>
    public ProductType Type { get; set; }
    
    /// <summary>Varsayılan ürün adı (çoklu dil için ProductTranslation kullanılır)</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Varsayılan açıklama</summary>
    public string? Description { get; set; }
    
    // Fiyatlandırma
    /// <summary>Alış fiyatı</summary>
    public decimal PurchasePrice { get; set; }
    
    /// <summary>Satış fiyatı</summary>
    public decimal SalePrice { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>KDV oranı (%)</summary>
    public decimal VatRate { get; set; }
    
    // Stok Yönetimi
    /// <summary>Birim (Adet, Kg, Litre, m², vb.)</summary>
    public string Unit { get; set; } = "Adet";
    
    /// <summary>Stok takibi yapılsın mı?</summary>
    public bool TrackStock { get; set; } = true;
    
    /// <summary>Minimum stok seviyesi (alarm)</summary>
    public decimal MinStockLevel { get; set; }
    
    /// <summary>Mevcut stok miktarı (hesaplanmış - read-only)</summary>
    public decimal StockQuantity { get; set; }
    
    // Durum
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Satışa açık mı?</summary>
    public bool IsForSale { get; set; } = true;
    
    /// <summary>Satın alınabilir mi?</summary>
    public bool IsForPurchase { get; set; } = true;
    
    // Görsel & SEO
    /// <summary>Ürün resmi URL</summary>
    public string? ImageUrl { get; set; }
    
    // Kategori İlişkisi
    /// <summary>Kategori ID - Ürünün ait olduğu kategori</summary>
    public Guid? CategoryId { get; set; }
    
    /// <summary>Ürün kategorisi - Navigation property</summary>
    public virtual ProductCategory? Category { get; set; }
    
    // Navigation Properties
    /// <summary>Çoklu dil çevirileri</summary>
    public ICollection<ProductTranslation> Translations { get; set; } = new List<ProductTranslation>();
}

