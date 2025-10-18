using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Commands.RejectExpense;

/// <summary>
/// Gider reddetme komutu
/// </summary>
public record RejectExpenseCommand : IRequest<Result<bool>>
{
    public Guid ExpenseId { get; init; }
    public string RejectionReason { get; init; } = string.Empty;
}

