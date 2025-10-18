using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Commands.ApproveExpense;

/// <summary>
/// Gider onaylama komutu
/// </summary>
public record ApproveExpenseCommand(Guid ExpenseId) : IRequest<Result<bool>>;

