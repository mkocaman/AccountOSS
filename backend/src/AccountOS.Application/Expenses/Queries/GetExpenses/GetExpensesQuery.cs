using AccountOS.Application.Common;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Expenses.Queries.GetExpenses;

public record GetExpensesQuery : IRequest<Result<List<ExpenseDto>>>
{
    public Guid? CategoryId { get; init; }
    public Guid? SupplierId { get; init; }
    public ExpenseStatus? Status { get; init; }
    public ExpenseApprovalStatus? ApprovalStatus { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

