using AccountOS.Application.Common;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Products.Commands.CreateProduct;

/// <summary>
/// Yeni ürün oluşturma komutu
/// </summary>
public record CreateProductCommand : IRequest<Result<ProductDto>>
{
    /// <summary>Ürün adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
    
    /// <summary>Tip (Mal/Hizmet)</summary>
    public ProductType Type { get; init; } = ProductType.Goods;
    
    /// <summary>Barkod (opsiyonel)</summary>
    public string? Barcode { get; init; }
    
    /// <summary>Alış fiyatı</summary>
    public decimal PurchasePrice { get; init; }
    
    /// <summary>Satış fiyatı</summary>
    public decimal SalePrice { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = "TRY";
    
    /// <summary>KDV oranı (%)</summary>
    public decimal VatRate { get; init; } = 20;
    
    /// <summary>Birim</summary>
    public string Unit { get; init; } = "Adet";
    
    /// <summary>Stok takibi yapılsın mı?</summary>
    public bool TrackStock { get; init; } = true;
    
    /// <summary>Minimum stok seviyesi</summary>
    public decimal MinStockLevel { get; init; }
    
    /// <summary>Ürün resmi URL</summary>
    public string? ImageUrl { get; init; }
    
    /// <summary>Çeviriler (opsiyonel)</summary>
    public List<ProductTranslationInput>? Translations { get; init; }
}

/// <summary>
/// Ürün çeviri giriş modeli
/// </summary>
public record ProductTranslationInput
{
    /// <summary>Dil kodu (TR, EN, RU, vb.)</summary>
    public string LanguageCode { get; init; } = string.Empty;
    
    /// <summary>Çevrilmiş ürün adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Çevrilmiş açıklama</summary>
    public string? Description { get; init; }
}

