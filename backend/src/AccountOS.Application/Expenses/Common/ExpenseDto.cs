using AccountOS.Domain.Enums;

namespace AccountOS.Application.Expenses.Common;

public record ExpenseDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string ExpenseNumber { get; init; } = string.Empty;
    public Guid CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public Guid? SupplierId { get; init; }
    public string? SupplierName { get; init; }
    public DateTime ExpenseDate { get; init; }
    public DateTime? PaymentDate { get; init; }
    public string Title { get; init; } = string.Empty;
    public string? Description { get; init; }
    public decimal Amount { get; init; }
    public string Currency { get; init; } = string.Empty;
    public decimal ExchangeRate { get; init; }
    public string BaseCurrency { get; init; } = string.Empty;
    public decimal AmountInBase { get; init; }
    public decimal VatAmount { get; init; }
    public decimal VatRate { get; init; }
    public ExpensePaymentMethod PaymentMethod { get; init; }
    public string PaymentMethodName { get; init; } = string.Empty;
    public ExpenseStatus Status { get; init; }
    public string StatusName { get; init; } = string.Empty;
    public ExpenseApprovalStatus ApprovalStatus { get; init; }
    public string ApprovalStatusName { get; init; } = string.Empty;
    public Guid? ApprovedBy { get; init; }
    public string? ApproverName { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? RejectionReason { get; init; }
    public string? InvoiceNumber { get; init; }
    public string? ReferenceNumber { get; init; }
    public bool IsRecurring { get; init; }
    public RecurringFrequency? RecurringFrequency { get; init; }
    public string? RecurringFrequencyName { get; init; }
    public DateTime? RecurringEndDate { get; init; }
    public string? Notes { get; init; }
    public List<string> Tags { get; init; } = new();
    public DateTime CreatedAt { get; init; }
}

