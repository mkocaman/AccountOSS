using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Stock.Commands.RemoveStock;

/// <summary>
/// Stok çıkarma komutu (Sales, Transfer) - FIFO ile
/// </summary>
public record RemoveStockCommand : IRequest<Result<decimal>>
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; init; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; init; }
    
    /// <summary>Referans tipi (Sales, Transfer)</summary>
    public string ReferenceType { get; init; } = "Sales";
    
    /// <summary>Referans ID</summary>
    public Guid? ReferenceId { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

