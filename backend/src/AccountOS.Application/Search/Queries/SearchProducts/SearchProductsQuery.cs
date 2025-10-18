using AccountOS.Application.Common;
using AccountOS.Application.Products.Common;
using AccountOS.Application.Search.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchProducts;

/// <summary>
/// Gelişmiş ürün arama query
/// </summary>
public record SearchProductsQuery : IRequest<Result<List<ProductDto>>>
{
    public ProductSearchFilter Filter { get; init; } = new();
}

