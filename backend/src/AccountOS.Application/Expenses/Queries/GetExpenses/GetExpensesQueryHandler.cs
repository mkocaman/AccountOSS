using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Queries.GetExpenses;

public class GetExpensesQueryHandler 
    : IRequestHandler<GetExpensesQuery, Result<List<ExpenseDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetExpensesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ExpenseDto>>> Handle(
        GetExpensesQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<ExpenseDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.Expenses
            .Include(e => e.Category)
            .Include(e => e.Supplier)
            .Where(e => e.CompanyId == companyId);

        if (request.CategoryId.HasValue)
            query = query.Where(e => e.CategoryId == request.CategoryId.Value);

        if (request.SupplierId.HasValue)
            query = query.Where(e => e.SupplierId == request.SupplierId.Value);

        if (request.Status.HasValue)
            query = query.Where(e => e.Status == request.Status.Value);

        if (request.StartDate.HasValue)
            query = query.Where(e => e.ExpenseDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(e => e.ExpenseDate <= request.EndDate.Value);

        if (request.ApprovalStatus.HasValue)
            query = query.Where(e => e.ApprovalStatus == request.ApprovalStatus.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(e =>
                e.Title.ToLower().Contains(searchTerm) ||
                e.ExpenseNumber.ToLower().Contains(searchTerm) ||
                (e.Description != null && e.Description.ToLower().Contains(searchTerm)));
        }

        // Pagination
        var skip = (request.PageNumber - 1) * request.PageSize;

        var expenses = await query
            .OrderByDescending(e => e.ExpenseDate)
            .Skip(skip)
            .Take(request.PageSize)
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
                Notes = e.Notes,
                CreatedAt = e.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<ExpenseDto>>.Ok(expenses);
    }

    private static string GetPaymentMethodName(Domain.Enums.ExpensePaymentMethod method)
    {
        return method switch
        {
            Domain.Enums.ExpensePaymentMethod.Cash => "Nakit",
            Domain.Enums.ExpensePaymentMethod.BankTransfer => "Banka Havalesi",
            Domain.Enums.ExpensePaymentMethod.CreditCard => "Kredi Kartı",
            Domain.Enums.ExpensePaymentMethod.Check => "Çek",
            Domain.Enums.ExpensePaymentMethod.PromissoryNote => "Senet",
            Domain.Enums.ExpensePaymentMethod.Other => "Diğer",
            _ => method.ToString()
        };
    }

    private static string GetStatusName(Domain.Enums.ExpenseStatus status)
    {
        return status switch
        {
            Domain.Enums.ExpenseStatus.Draft => "Taslak",
            Domain.Enums.ExpenseStatus.Pending => "Beklemede",
            Domain.Enums.ExpenseStatus.Approved => "Onaylandı",
            Domain.Enums.ExpenseStatus.Paid => "Ödendi",
            Domain.Enums.ExpenseStatus.Rejected => "Reddedildi",
            Domain.Enums.ExpenseStatus.Cancelled => "İptal",
            _ => status.ToString()
        };
    }

    private static string GetApprovalStatusName(Domain.Enums.ExpenseApprovalStatus status)
    {
        return status switch
        {
            Domain.Enums.ExpenseApprovalStatus.NotRequired => "Gerekmiyor",
            Domain.Enums.ExpenseApprovalStatus.Pending => "Bekliyor",
            Domain.Enums.ExpenseApprovalStatus.Approved => "Onaylandı",
            Domain.Enums.ExpenseApprovalStatus.Rejected => "Reddedildi",
            _ => status.ToString()
        };
    }
}

