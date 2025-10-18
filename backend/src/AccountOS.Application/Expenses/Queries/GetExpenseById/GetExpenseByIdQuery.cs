using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Queries.GetExpenseById;

public record GetExpenseByIdQuery(Guid Id) : IRequest<Result<ExpenseDto>>;

