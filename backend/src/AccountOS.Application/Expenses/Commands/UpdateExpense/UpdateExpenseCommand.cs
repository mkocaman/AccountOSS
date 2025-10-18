using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Expenses.Commands.UpdateExpense;

public record UpdateExpenseCommand : IRequest<Result<ExpenseDto>>
{
    public Guid Id { get; init; }
    public Guid CategoryId { get; init; }
    public Guid? SupplierId { get; init; }
    public DateTime ExpenseDate { get; init; }
    public DateTime? PaymentDate { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = "TRY";
    public decimal VatRate { get; init; }
    public ExpensePaymentMethod PaymentMethod { get; init; }
    public string? InvoiceNumber { get; init; }
    public string? ReferenceNumber { get; init; }
    public bool IsRecurring { get; init; }
    public RecurringFrequency? RecurringFrequency { get; init; }
    public DateTime? RecurringEndDate { get; init; }
    public string? Notes { get; init; }
    public List<string>? Tags { get; init; }
}

