using AccountOS.Domain.Enums;

namespace AccountOS.Application.Products.Common;

/// <summary>
/// Ürün DTO
/// </summary>
public record ProductDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; init; }
    
    /// <summary>Ürün kodu</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Barkod</summary>
    public string? Barcode { get; init; }
    
    /// <summary>Tip (Mal/Hizmet)</summary>
    public ProductType Type { get; init; }
    
    /// <summary>Tip adı</summary>
    public string TypeName { get; init; } = string.Empty;
    
    /// <summary>Ürün adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
    
    /// <summary>Alış fiyatı</summary>
    public decimal PurchasePrice { get; init; }
    
    /// <summary>Satış fiyatı</summary>
    public decimal SalePrice { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>KDV oranı</summary>
    public decimal VatRate { get; init; }
    
    /// <summary>Birim</summary>
    public string Unit { get; init; } = string.Empty;
    
    /// <summary>Stok takibi yapılıyor mu?</summary>
    public bool TrackStock { get; init; }
    
    /// <summary>Minimum stok seviyesi</summary>
    public decimal MinStockLevel { get; init; }
    
    /// <summary>Mevcut stok miktarı</summary>
    public decimal StockQuantity { get; init; }
    
    /// <summary>Stok durumu (Low Stock uyarısı)</summary>
    public string StockStatus { get; init; } = string.Empty;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Satışa açık mı?</summary>
    public bool IsForSale { get; init; }
    
    /// <summary>Satın alınabilir mi?</summary>
    public bool IsForPurchase { get; init; }
    
    /// <summary>Ürün resmi URL</summary>
    public string? ImageUrl { get; init; }
    
    /// <summary>Çeviriler</summary>
    public List<ProductTranslationDto> Translations { get; init; } = new();
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
}

