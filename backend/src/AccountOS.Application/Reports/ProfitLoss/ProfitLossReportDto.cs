using AccountOS.Application.Reports.Common;

namespace AccountOS.Application.Reports.ProfitLoss;

/// <summary>
/// Kar/Zarar raporu DTO
/// </summary>
public record ProfitLossReportDto
{
    public DateTime GeneratedAt { get; init; }
    public ReportDateRange DateRange { get; init; } = null!;
    public ProfitLossSummary Summary { get; init; } = null!;
    public List<MonthlyProfitLossDto> MonthlyData { get; init; } = new();
    public List<ProductProfitabilityDto> ProductProfitability { get; init; } = new();
}

public record ProfitLossSummary
{
    /// <summary>Toplam satış geliri</summary>
    public decimal TotalRevenue { get; init; }
    
    /// <summary>Toplam satış maliyeti (FIFO)</summary>
    public decimal TotalCost { get; init; }
    
    /// <summary>Brüt kar</summary>
    public decimal GrossProfit => TotalRevenue - TotalCost;
    
    /// <summary>Brüt kar marjı (%)</summary>
    public decimal GrossProfitMargin => TotalRevenue > 0 
        ? (GrossProfit / TotalRevenue) * 100 
        : 0;
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>Fatura sayısı</summary>
    public int InvoiceCount { get; init; }
    
    /// <summary>Ortalama fatura karı</summary>
    public decimal AverageProfitPerInvoice => InvoiceCount > 0 
        ? GrossProfit / InvoiceCount 
        : 0;
}

public record MonthlyProfitLossDto
{
    public int Year { get; init; }
    public int Month { get; init; }
    public string MonthName { get; init; } = string.Empty;
    public decimal Revenue { get; init; }
    public decimal Cost { get; init; }
    public decimal GrossProfit => Revenue - Cost;
    public decimal GrossProfitMargin => Revenue > 0 
        ? (GrossProfit / Revenue) * 100 
        : 0;
    public string Currency { get; init; } = string.Empty;
}

public record ProductProfitabilityDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal TotalQuantitySold { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal TotalRevenue { get; init; }
    public decimal TotalCost { get; init; }
    public decimal GrossProfit => TotalRevenue - TotalCost;
    public decimal GrossProfitMargin => TotalRevenue > 0 
        ? (GrossProfit / TotalRevenue) * 100 
        : 0;
    public string Currency { get; init; } = string.Empty;
}

