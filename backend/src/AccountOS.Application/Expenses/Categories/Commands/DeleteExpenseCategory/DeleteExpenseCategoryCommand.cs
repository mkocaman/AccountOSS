using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Categories.Commands.DeleteExpenseCategory;

public record DeleteExpenseCategoryCommand(Guid Id) : IRequest<Result<bool>>;

