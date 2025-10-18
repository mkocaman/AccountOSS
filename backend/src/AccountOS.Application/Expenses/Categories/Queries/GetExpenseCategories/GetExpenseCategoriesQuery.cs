using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategories;

public record GetExpenseCategoriesQuery : IRequest<Result<List<ExpenseCategoryDto>>>
{
    public bool? IsActive { get; init; }
    public Guid? ParentCategoryId { get; init; }
    public string? SearchTerm { get; init; }
}

