namespace AccountOS.Application.Expenses.Common;

public record ExpenseCategoryDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? ParentCategoryId { get; init; }
    public string? ParentCategoryName { get; init; }
    public decimal? MonthlyBudget { get; init; }
    public string Currency { get; init; } = string.Empty;
    public string? ColorCode { get; init; }
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
    public int SubCategoryCount { get; init; }
    public int ExpenseCount { get; init; }
}

