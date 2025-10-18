using AccountOS.Application.Common;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Ürün güncelleme komutu
/// </summary>
public record UpdateProductCommand : IRequest<Result<ProductDto>>
{
    /// <summary>Ürün ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Ürün adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
    
    /// <summary>Tip</summary>
    public ProductType Type { get; init; }
    
    /// <summary>Barkod</summary>
    public string? Barcode { get; init; }
    
    /// <summary>Alış fiyatı</summary>
    public decimal PurchasePrice { get; init; }
    
    /// <summary>Satış fiyatı</summary>
    public decimal SalePrice { get; init; }
    
    /// <summary>Para birimi</summary>
    public string? Currency { get; init; }
    
    /// <summary>KDV oranı</summary>
    public decimal VatRate { get; init; }
    
    /// <summary>Birim</summary>
    public string? Unit { get; init; }
    
    /// <summary>Stok takibi</summary>
    public bool TrackStock { get; init; }
    
    /// <summary>Minimum stok seviyesi</summary>
    public decimal MinStockLevel { get; init; }
    
    /// <summary>Ürün resmi URL</summary>
    public string? ImageUrl { get; init; }
}

