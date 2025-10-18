using AccountOS.Application.Common;
using AccountOS.Application.Stock.Common;
using MediatR;

namespace AccountOS.Application.Stock.Queries.GetStockLayers;

/// <summary>
/// Stok katmanlarını listele sorgusu
/// </summary>
public record GetStockLayersQuery : IRequest<Result<List<StockLayerDto>>>
{
    /// <summary>Ürün ID (opsiyonel - belirli ürün için)</summary>
    public Guid? ProductId { get; init; }
    
    /// <summary>Sadece aktif katmanlar (RemainingQuantity > 0)</summary>
    public bool ActiveOnly { get; init; } = true;
}

