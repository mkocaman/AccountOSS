using AccountOS.Application.Common;
using AccountOS.Application.Stock.Common;
using MediatR;

namespace AccountOS.Application.Stock.Queries.GetStockMovements;

/// <summary>
/// Stok hareketlerini listele sorgusu
/// </summary>
public record GetStockMovementsQuery : IRequest<Result<List<StockMovementDto>>>
{
    /// <summary>Ürün ID (opsiyonel)</summary>
    public Guid? ProductId { get; init; }
    
    /// <summary>Başlangıç tarihi</summary>
    public DateTime? StartDate { get; init; }
    
    /// <summary>Bitiş tarihi</summary>
    public DateTime? EndDate { get; init; }
}

