using AccountOS.Application.Reports.Common;

namespace AccountOS.Application.Reports.Sales;

/// <summary>
/// Satış raporu DTO
/// </summary>
public record SalesReportDto
{
    /// <summary>Rapor tarihi</summary>
    public DateTime GeneratedAt { get; init; }
    
    /// <summary>Tarih aralığı</summary>
    public ReportDateRange DateRange { get; init; } = null!;
    
    /// <summary>Özet bilgiler</summary>
    public SalesReportSummary Summary { get; init; } = null!;
    
    /// <summary>Günlük detaylar</summary>
    public List<DailySalesDto> DailySales { get; init; } = new();
    
    /// <summary>Aylık detaylar</summary>
    public List<MonthlySalesDto> MonthlySales { get; init; } = new();
    
    /// <summary>Müşterilere göre satışlar</summary>
    public List<SalesByCustomerDto> SalesByCustomer { get; init; } = new();
    
    /// <summary>Ürünlere göre satışlar</summary>
    public List<SalesByProductDto> SalesByProduct { get; init; } = new();
}

public record SalesReportSummary
{
    /// <summary>Toplam fatura sayısı</summary>
    public int TotalInvoices { get; init; }
    
    /// <summary>Toplam satış tutarı</summary>
    public decimal TotalAmount { get; init; }
    
    /// <summary>Toplam KDV</summary>
    public decimal TotalVat { get; init; }
    
    /// <summary>Toplam indirim</summary>
    public decimal TotalDiscount { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>Ortalama fatura tutarı</summary>
    public decimal AverageInvoiceAmount => TotalInvoices > 0 
        ? TotalAmount / TotalInvoices 
        : 0;
    
    /// <summary>Para birimine göre dağılım</summary>
    public List<CurrencyAmount> ByCurrency { get; init; } = new();
    
    /// <summary>Önceki dönemle karşılaştırma</summary>
    public PeriodComparison? Comparison { get; init; }
}

public record DailySalesDto
{
    public DateTime Date { get; init; }
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record MonthlySalesDto
{
    public int Year { get; init; }
    public int Month { get; init; }
    public string MonthName { get; init; } = string.Empty;
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal TotalVat { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record SalesByCustomerDto
{
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public int InvoiceCount { get; init; }
    public decimal TotalAmount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal Percentage { get; init; }
}

public record SalesByProductDto
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

