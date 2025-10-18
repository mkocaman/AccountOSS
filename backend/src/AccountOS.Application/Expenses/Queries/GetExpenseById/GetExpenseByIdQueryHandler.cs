using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AccountOS.Application.Expenses.Queries.GetExpenseById;

public class GetExpenseByIdQueryHandler 
    : IRequestHandler<GetExpenseByIdQuery, Result<ExpenseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetExpenseByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ExpenseDto>> Handle(
        GetExpenseByIdQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var expense = await _context.Expenses
            .Where(e => e.Id == request.Id && e.CompanyId == companyId)
            .Select(e => new ExpenseDto
            {
                Id = e.Id,
                CompanyId = e.CompanyId,
                ExpenseNumber = e.ExpenseNumber,
                CategoryId = e.CategoryId,
                CategoryName = e.Category.Name,
                SupplierId = e.SupplierId,
                SupplierName = e.Supplier != null ? e.Supplier.Name : null,
                ExpenseDate = e.ExpenseDate,
                PaymentDate = e.PaymentDate,
                Title = e.Title,
                Description = e.Description,
                Amount = e.Amount,
                Currency = e.Currency,
                ExchangeRate = e.ExchangeRate,
                BaseCurrency = e.BaseCurrency,
                AmountInBase = e.AmountInBase,
                VatAmount = e.VatAmount,
                VatRate = e.VatRate,
                PaymentMethod = e.PaymentMethod,
                PaymentMethodName = GetPaymentMethodName(e.PaymentMethod),
                Status = e.Status,
                StatusName = GetStatusName(e.Status),
                ApprovalStatus = e.ApprovalStatus,
                ApprovalStatusName = GetApprovalStatusName(e.ApprovalStatus),
                ApprovedBy = e.ApprovedBy,
                ApproverName = e.Approver != null ? e.Approver.UserName : null,
                ApprovedAt = e.ApprovedAt,
                RejectionReason = e.RejectionReason,
                InvoiceNumber = e.InvoiceNumber,
                ReferenceNumber = e.ReferenceNumber,
                IsRecurring = e.IsRecurring,
                RecurringFrequency = e.RecurringFrequency,
                RecurringFrequencyName = e.RecurringFrequency.HasValue ? GetRecurringFrequencyName(e.RecurringFrequency.Value) : null,
                RecurringEndDate = e.RecurringEndDate,
                Notes = e.Notes,
                Tags = new List<string>(),
                CreatedAt = e.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (expense == null)
            return Result<ExpenseDto>.Fail("Gider bulunamadı");

        return Result<ExpenseDto>.Ok(expense);
    }

    private static string GetPaymentMethodName(ExpensePaymentMethod method)
    {
        return method switch
        {
            ExpensePaymentMethod.Cash => "Nakit",
            ExpensePaymentMethod.BankTransfer => "Banka Havalesi",
            ExpensePaymentMethod.CreditCard => "Kredi Kartı",
            ExpensePaymentMethod.Check => "Çek",
            ExpensePaymentMethod.PromissoryNote => "Senet",
            ExpensePaymentMethod.Other => "Diğer",
            _ => method.ToString()
        };
    }

    private static string GetStatusName(ExpenseStatus status)
    {
        return status switch
        {
            ExpenseStatus.Draft => "Taslak",
            ExpenseStatus.Pending => "Beklemede",
            ExpenseStatus.Approved => "Onaylandı",
            ExpenseStatus.Paid => "Ödendi",
            ExpenseStatus.Rejected => "Reddedildi",
            ExpenseStatus.Cancelled => "İptal",
            _ => status.ToString()
        };
    }

    private static string GetApprovalStatusName(ExpenseApprovalStatus status)
    {
        return status switch
        {
            ExpenseApprovalStatus.NotRequired => "Onay Gerekmiyor",
            ExpenseApprovalStatus.Pending => "Onay Bekliyor",
            ExpenseApprovalStatus.Approved => "Onaylandı",
            ExpenseApprovalStatus.Rejected => "Reddedildi",
            _ => status.ToString()
        };
    }

    private static string GetRecurringFrequencyName(RecurringFrequency frequency)
    {
        return frequency switch
        {
            RecurringFrequency.Daily => "Günlük",
            RecurringFrequency.Weekly => "Haftalık",
            RecurringFrequency.Monthly => "Aylık",
            RecurringFrequency.Quarterly => "3 Aylık",
            RecurringFrequency.SemiAnnually => "6 Aylık",
            RecurringFrequency.Annually => "Yıllık",
            _ => frequency.ToString()
        };
    }
}

