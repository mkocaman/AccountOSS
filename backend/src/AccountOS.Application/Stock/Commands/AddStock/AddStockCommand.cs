using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Stock.Commands.AddStock;

/// <summary>
/// Stok ekleme komutu (Purchase, Return, Adjustment)
/// </summary>
public record AddStockCommand : IRequest<Result<decimal>>
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; init; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; init; }
    
    /// <summary>Birim maliyet</summary>
    public decimal UnitCost { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = "TRY";
    
    /// <summary>Referans tipi (Purchase, Return, Adjustment)</summary>
    public string ReferenceType { get; init; } = "Adjustment";
    
    /// <summary>Referans ID</summary>
    public Guid? ReferenceId { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

