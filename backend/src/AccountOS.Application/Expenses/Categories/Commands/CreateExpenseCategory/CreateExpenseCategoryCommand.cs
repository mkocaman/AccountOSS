using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Categories.Commands.CreateExpenseCategory;

public record CreateExpenseCategoryCommand : IRequest<Result<ExpenseCategoryDto>>
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public Guid? ParentCategoryId { get; init; }
    public decimal? MonthlyBudget { get; init; }
    public string Currency { get; init; } = "TRY";
    public string? ColorCode { get; init; }
    public int DisplayOrder { get; init; }
}

