using AccountOS.Domain.Enums;

namespace AccountOS.Application.Accounting.Common;

public record ChartOfAccountDto
{
    public Guid Id { get; init; }
    public string AccountCode { get; init; } = string.Empty;
    public string AccountName { get; init; } = string.Empty;
    public AccountType AccountType { get; init; }
    public string AccountTypeName { get; init; } = string.Empty;
    public Guid? ParentAccountId { get; init; }
    public string? ParentAccountName { get; init; }
    public int Level { get; init; }
    public BalanceType NormalBalance { get; init; }
    public string NormalBalanceName { get; init; } = string.Empty;
    public string Currency { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public bool IsSystemAccount { get; init; }
}

