using AccountOS.Application.Common;
using AccountOS.Application.Products.Common;
using MediatR;

namespace AccountOS.Application.Products.Queries.GetProducts;

/// <summary>
/// Ürünleri listele
/// </summary>
public record GetProductsQuery : IRequest<Result<List<ProductDto>>>
{
    /// <summary>Arama terimi (ad, kod, barkod)</summary>
    public string? SearchTerm { get; init; }
    
    /// <summary>Sadece aktif ürünleri getir</summary>
    public bool ActiveOnly { get; init; } = true;
    
    /// <summary>Sadece stok takipli ürünleri getir</summary>
    public bool? TrackStockOnly { get; init; }
}

