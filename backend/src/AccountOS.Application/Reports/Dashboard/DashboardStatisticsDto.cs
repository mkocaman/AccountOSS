using AccountOS.Application.Reports.Common;

namespace AccountOS.Application.Reports.Dashboard;

/// <summary>
/// Dashboard istatistikleri DTO
/// </summary>
public record DashboardStatisticsDto
{
    public DateTime GeneratedAt { get; init; }
    
    /// <summary>Satış özeti</summary>
    public SalesStatistics Sales { get; init; } = null!;
    
    /// <summary>Alış özeti</summary>
    public PurchaseStatistics Purchases { get; init; } = null!;
    
    /// <summary>Ödeme özeti</summary>
    public PaymentStatistics Payments { get; init; } = null!;
    
    /// <summary>Müşteri özeti</summary>
    public CustomerStatistics Customers { get; init; } = null!;
    
    /// <summary>Stok özeti</summary>
    public StockStatistics Stock { get; init; } = null!;
    
    /// <summary>Son faaliyetler</summary>
    public List<RecentActivityDto> RecentActivities { get; init; } = new();
}

public record SalesStatistics
{
    public decimal ThisMonth { get; init; }
    public decimal LastMonth { get; init; }
    public PeriodComparison Comparison { get; init; } = null!;
    public int InvoiceCount { get; init; }
    public decimal AverageInvoiceValue { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record PurchaseStatistics
{
    public decimal ThisMonth { get; init; }
    public decimal LastMonth { get; init; }
    public PeriodComparison Comparison { get; init; } = null!;
    public int InvoiceCount { get; init; }
    public decimal AverageInvoiceValue { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record PaymentStatistics
{
    public decimal TotalReceived { get; init; }
    public decimal TotalPaid { get; init; }
    public decimal NetCashFlow => TotalReceived - TotalPaid;
    public decimal PendingReceivables { get; init; }
    public decimal OverdueReceivables { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record CustomerStatistics
{
    public int TotalCustomers { get; init; }
    public int ActiveCustomers { get; init; }
    public int NewCustomersThisMonth { get; init; }
    public List<TopCustomerDto> TopCustomers { get; init; } = new();
}

public record StockStatistics
{
    public int TotalProducts { get; init; }
    public int LowStockProducts { get; init; }
    public int OutOfStockProducts { get; init; }
    public decimal TotalStockValue { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record TopCustomerDto
{
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public decimal TotalPurchases { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record RecentActivityDto
{
    public DateTime Timestamp { get; init; }
    public string ActivityType { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ReferenceNumber { get; init; }
    public decimal? Amount { get; init; }
    public string? Currency { get; init; }
}

