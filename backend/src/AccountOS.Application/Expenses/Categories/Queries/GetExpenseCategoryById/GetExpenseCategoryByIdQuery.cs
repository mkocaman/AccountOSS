using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategoryById;

public record GetExpenseCategoryByIdQuery(Guid Id) : IRequest<Result<ExpenseCategoryDto>>;

