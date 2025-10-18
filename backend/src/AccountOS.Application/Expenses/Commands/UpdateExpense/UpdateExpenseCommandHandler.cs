using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AccountOS.Application.Expenses.Commands.UpdateExpense;

public class UpdateExpenseCommandHandler 
    : IRequestHandler<UpdateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateExpenseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ExpenseDto>> Handle(
        UpdateExpenseCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var expense = await _context.Expenses
            .Where(e => e.Id == request.Id && e.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (expense == null)
            return Result<ExpenseDto>.Fail("Gider bulunamadı");

        // Onaylanmış veya ödenmiş giderler güncellenemez
        if (expense.Status == ExpenseStatus.Paid)
            return Result<ExpenseDto>.Fail("Ödenmiş gider güncellenemez");

        if (expense.ApprovalStatus == ExpenseApprovalStatus.Approved)
            return Result<ExpenseDto>.Fail("Onaylanmış gider güncellenemez");

        // Kategori kontrolü
        var categoryExists = await _context.ExpenseCategories
            .AnyAsync(c => c.Id == request.CategoryId && c.CompanyId == companyId && c.IsActive, cancellationToken);

        if (!categoryExists)
            return Result<ExpenseDto>.Fail("Kategori bulunamadı veya aktif değil");

        // Tedarikçi kontrolü
        if (request.SupplierId.HasValue)
        {
            var supplierExists = await _context.Customers
                .AnyAsync(c => c.Id == request.SupplierId.Value && c.CompanyId == companyId, cancellationToken);

            if (!supplierExists)
                return Result<ExpenseDto>.Fail("Tedarikçi bulunamadı");
        }

        // Döviz kuru
        var baseCurrency = "TRY";
        var exchangeRate = 1m;

        if (request.Currency != baseCurrency)
        {
            var fxRate = await _context.FxRates
                .Where(r => r.BaseCurrencyCode == request.Currency && r.QuoteCurrencyCode == baseCurrency && r.EffectiveDate <= request.ExpenseDate)
                .OrderByDescending(r => r.EffectiveDate)
                .FirstOrDefaultAsync(cancellationToken);

            if (fxRate == null)
                return Result<ExpenseDto>.Fail($"{request.Currency} için döviz kuru bulunamadı");

            exchangeRate = fxRate.Rate;
        }

        // KDV hesaplama
        var vatAmount = request.Amount * request.VatRate / 100;
        var amountInBase = (request.Amount + vatAmount) * exchangeRate;

        expense.CategoryId = request.CategoryId;
        expense.SupplierId = request.SupplierId;
        expense.ExpenseDate = request.ExpenseDate;
        expense.PaymentDate = request.PaymentDate;
        expense.Title = request.Title;
        expense.Description = request.Description;
        expense.Amount = request.Amount;
        expense.Currency = request.Currency;
        expense.ExchangeRate = exchangeRate;
        expense.AmountInBase = amountInBase;
        expense.VatAmount = vatAmount;
        expense.VatRate = request.VatRate;
        expense.PaymentMethod = request.PaymentMethod;
        expense.InvoiceNumber = request.InvoiceNumber;
        expense.ReferenceNumber = request.ReferenceNumber;
        expense.IsRecurring = request.IsRecurring;
        expense.RecurringFrequency = request.RecurringFrequency;
        expense.RecurringEndDate = request.RecurringEndDate;
        expense.Notes = request.Notes;
        expense.Tags = request.Tags != null && request.Tags.Any() ? JsonSerializer.Serialize(request.Tags) : null;
        expense.UpdatedAt = DateTime.UtcNow;
        expense.UpdatedBy = _currentUser.UserId ?? Guid.Empty;

        if (request.PaymentDate.HasValue && expense.Status == ExpenseStatus.Draft)
        {
            expense.Status = ExpenseStatus.Paid;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = await MapToDtoAsync(expense.Id, cancellationToken);
        return Result<ExpenseDto>.Ok(dto!);
    }

    private async Task<ExpenseDto?> MapToDtoAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Expenses
            .Where(e => e.Id == id)
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
                PaymentMethodName = e.PaymentMethod.ToString(),
                Status = e.Status,
                StatusName = e.Status.ToString(),
                ApprovalStatus = e.ApprovalStatus,
                ApprovalStatusName = e.ApprovalStatus.ToString(),
                Notes = e.Notes,
                CreatedAt = e.CreatedAt
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}

