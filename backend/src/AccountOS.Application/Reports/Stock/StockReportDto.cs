namespace AccountOS.Application.Reports.Stock;

/// <summary>
/// Stok raporu DTO
/// </summary>
public record StockReportDto
{
    public DateTime GeneratedAt { get; init; }
    public StockReportSummary Summary { get; init; } = null!;
    public List<StockLevelDto> StockLevels { get; init; } = new();
    public List<LowStockAlertDto> LowStockAlerts { get; init; } = new();
}

public record StockReportSummary
{
    /// <summary>Toplam ürün sayısı</summary>
    public int TotalProducts { get; init; }
    
    /// <summary>Stoklu ürün sayısı</summary>
    public int ProductsInStock { get; init; }
    
    /// <summary>Stok dışı ürün sayısı</summary>
    public int OutOfStockProducts { get; init; }
    
    /// <summary>Düşük stok uyarısı olan ürünler</summary>
    public int LowStockProducts { get; init; }
    
    /// <summary>Toplam stok değeri</summary>
    public decimal TotalStockValue { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
}

public record StockLevelDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal CurrentQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal MinStockLevel { get; init; }
    public decimal AverageCost { get; init; }
    public decimal TotalValue { get; init; }
    public string Currency { get; init; } = string.Empty;
    public bool IsLowStock => CurrentQuantity < MinStockLevel && MinStockLevel > 0;
    public bool IsOutOfStock => CurrentQuantity <= 0;
}

public record LowStockAlertDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal CurrentQuantity { get; init; }
    public decimal MinStockLevel { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal ShortageQuantity => MinStockLevel - CurrentQuantity;
    public string AlertLevel => CurrentQuantity <= 0 
        ? "Critical" 
        : "Warning";
}

