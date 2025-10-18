using AccountOS.Application.Reports.Common;

namespace AccountOS.Application.Reports.Purchases;

/// <summary>
/// Alış raporu DTO
/// </summary>
public record PurchaseReportDto
{
    public DateTime GeneratedAt { get; init; }
    public ReportDateRange DateRange { get; init; } = null!;
    public PurchaseReportSummary Summary { get; init; } = null!;
    public List<DailyPurchaseDto> DailyPurchases { get; init; } = new();
    public List<MonthlyPurchaseDto> MonthlyPurchases { get; init; } = new();
    public List<PurchaseBySupplierDto> PurchaseBySupplier { get; init; } = new();
    public List<PurchaseByProductDto> PurchaseByProduct { get; init; } = new();
}

public record PurchaseReportSummary
{
    public int TotalInvoices { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public decimal TotalDiscount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal AverageInvoiceAmount => TotalInvoices > 0 
        ? TotalAmount / TotalInvoices 
        : 0;
    public List<CurrencyAmount> ByCurrency { get; init; } = new();
    public PeriodComparison? Comparison { get; init; }
}

public record DailyPurchaseDto
{
    public DateTime Date { get; init; }
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record MonthlyPurchaseDto
{
    public int Year { get; init; }
    public int Month { get; init; }
    public string MonthName { get; init; } = string.Empty;
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record PurchaseBySupplierDto
{
    public Guid SupplierId { get; init; }
    public string SupplierCode { get; init; } = string.Empty;
    public string SupplierName { get; init; } = string.Empty;
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal Percentage { get; init; }
}

public record PurchaseByProductDto
{
    public Guid ProductId { get; init; }
    public string ProductCode { get; init; } = string.Empty;
    public string ProductName { get; init; } = string.Empty;
    public decimal TotalQuantity { get; init; }
    public string Unit { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal AveragePrice { get; init; }
}

