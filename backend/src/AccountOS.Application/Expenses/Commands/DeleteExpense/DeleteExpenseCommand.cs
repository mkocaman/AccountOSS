using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Commands.DeleteExpense;

public record DeleteExpenseCommand(Guid Id) : IRequest<Result<bool>>;

