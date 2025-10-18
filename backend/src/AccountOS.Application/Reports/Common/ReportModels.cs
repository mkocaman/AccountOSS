namespace AccountOS.Application.Reports.Common;

/// <summary>
/// Rapor tarih aralığı
/// </summary>
public record ReportDateRange
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string DisplayText => $"{StartDate:dd.MM.yyyy} - {EndDate:dd.MM.yyyy}";
}

/// <summary>
/// Rapor filtre parametreleri
/// </summary>
public record ReportFilters
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? ProductId { get; init; }
    public string? Currency { get; init; }
    public bool IncludeDrafts { get; init; } = false;
}

/// <summary>
/// Para birimi tutarları
/// </summary>
public record CurrencyAmount
{
    public string Currency { get; init; } = string.Empty;
    public decimal Amount { get; init; }
}

/// <summary>
/// Dönemsel karşılaştırma
/// </summary>
public record PeriodComparison
{
    public decimal CurrentPeriod { get; init; }
    public decimal PreviousPeriod { get; init; }
    public decimal Change => CurrentPeriod - PreviousPeriod;
    public decimal ChangePercentage => PreviousPeriod != 0 
        ? (Change / PreviousPeriod) * 100 
        : 0;
    public bool IsIncrease => Change > 0;
}

