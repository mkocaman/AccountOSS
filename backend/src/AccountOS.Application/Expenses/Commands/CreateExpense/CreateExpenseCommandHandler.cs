using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Commands.CreateExpense;

public class CreateExpenseCommandHandler 
    : IRequestHandler<CreateExpenseCommand, Result<ExpenseDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDocumentNumberingService _documentNumbering;

    public CreateExpenseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDocumentNumberingService documentNumbering)
    {
        _context = context;
        _currentUser = currentUser;
        _documentNumbering = documentNumbering;
    }

    public async Task<Result<ExpenseDto>> Handle(
        CreateExpenseCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Category kontrolü
        var category = await _context.ExpenseCategories
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId && c.CompanyId == companyId, cancellationToken);

        if (category == null)
            return Result<ExpenseDto>.Fail("Gider kategorisi bulunamadı");

        // Supplier kontrolü (opsiyonel)
        if (request.SupplierId.HasValue)
        {
            var supplierExists = await _context.Customers
                .AnyAsync(c => c.Id == request.SupplierId.Value && c.CompanyId == companyId, cancellationToken);

            if (!supplierExists)
                return Result<ExpenseDto>.Fail("Tedarikçi bulunamadı");
        }

        // Company bilgisi
        var company = await _context.Companies.FindAsync(new object[] { companyId }, cancellationToken);
        if (company == null)
            return Result<ExpenseDto>.Fail("Şirket bulunamadı");

        // Expense number oluştur
        var expenseNumber = await _documentNumbering.GenerateNumberAsync("Expense", null, request.ExpenseDate, cancellationToken);

        // Exchange rate al
        var exchangeRate = 1m;
        if (request.Currency != company.BaseCurrency)
        {
            var fxRate = await _context.FxRates
                .Where(r => r.BaseCurrencyCode == request.Currency 
                         && r.QuoteCurrencyCode == company.BaseCurrency
                         && r.EffectiveDate <= request.ExpenseDate)
                .OrderByDescending(r => r.EffectiveDate)
                .FirstOrDefaultAsync(cancellationToken);

            exchangeRate = fxRate?.Rate ?? 1m;
        }

        // KDV hesapla
        var vatAmount = request.Amount * request.VatRate / 100;
        var totalAmount = request.Amount + vatAmount;
        var amountInBase = totalAmount * exchangeRate;

        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            ExpenseNumber = expenseNumber,
            CategoryId = request.CategoryId,
            SupplierId = request.SupplierId,
            ExpenseDate = request.ExpenseDate,
            Title = request.Title,
            Description = request.Description,
            Amount = request.Amount,
            Currency = request.Currency,
            ExchangeRate = exchangeRate,
            BaseCurrency = company.BaseCurrency,
            AmountInBase = amountInBase,
            VatAmount = vatAmount,
            VatRate = request.VatRate,
            PaymentMethod = request.PaymentMethod,
            Status = ExpenseStatus.Draft,
            ApprovalStatus = ExpenseApprovalStatus.NotRequired,
            InvoiceNumber = request.InvoiceNumber,
            Notes = request.Notes,
            IsRecurring = false,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.Expenses.Add(expense);
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

