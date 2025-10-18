namespace AccountOS.Application.Accounting.Common;

public record TrialBalanceDto
{
    public string AccountCode { get; init; } = string.Empty;
    public string AccountName { get; init; } = string.Empty;
    public decimal OpeningDebit { get; init; }
    public decimal OpeningCredit { get; init; }
    public decimal PeriodDebit { get; init; }
    public decimal PeriodCredit { get; init; }
    public decimal ClosingDebit { get; init; }
    public decimal ClosingCredit { get; init; }
}

