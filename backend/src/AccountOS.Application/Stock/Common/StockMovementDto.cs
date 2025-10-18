using AccountOS.Domain.Enums;

namespace AccountOS.Application.Stock.Common;

/// <summary>
/// Stok hareketi DTO
/// </summary>
public record StockMovementDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; init; }
    
    /// <summary>Ürün adı</summary>
    public string ProductName { get; init; } = string.Empty;
    
    /// <summary>Ürün kodu</summary>
    public string ProductCode { get; init; } = string.Empty;
    
    /// <summary>Hareket tarihi</summary>
    public DateTime MovementDate { get; init; }
    
    /// <summary>Hareket tipi</summary>
    public StockMovementType Type { get; init; }
    
    /// <summary>Hareket tipi adı</summary>
    public string TypeName { get; init; } = string.Empty;
    
    /// <summary>Referans tipi</summary>
    public string ReferenceType { get; init; } = string.Empty;
    
    /// <summary>Referans ID</summary>
    public Guid ReferenceId { get; init; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; init; }
    
    /// <summary>Birim maliyet</summary>
    public decimal UnitCost { get; init; }
    
    /// <summary>Toplam maliyet</summary>
    public decimal TotalCost { get; init; }
    
    /// <summary>Hareket sonrası bakiye</summary>
    public decimal BalanceAfter { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
}

