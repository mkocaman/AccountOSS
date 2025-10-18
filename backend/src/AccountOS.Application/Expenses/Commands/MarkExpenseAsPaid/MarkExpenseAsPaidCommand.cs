using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Expenses.Commands.MarkExpenseAsPaid;

/// <summary>
/// Gideri ödendi olarak işaretle
/// </summary>
public record MarkExpenseAsPaidCommand : IRequest<Result<bool>>
{
    public Guid ExpenseId { get; init; }
    public DateTime PaymentDate { get; init; }
}

