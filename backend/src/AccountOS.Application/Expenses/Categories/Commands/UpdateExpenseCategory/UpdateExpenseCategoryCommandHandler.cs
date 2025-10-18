using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Categories.Commands.UpdateExpenseCategory;

public class UpdateExpenseCategoryCommandHandler 
    : IRequestHandler<UpdateExpenseCategoryCommand, Result<ExpenseCategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateExpenseCategoryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ExpenseCategoryDto>> Handle(
        UpdateExpenseCategoryCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseCategoryDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var category = await _context.ExpenseCategories
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (category == null)
            return Result<ExpenseCategoryDto>.Fail("Kategori bulunamadı");

        // Kod benzersizliği kontrolü (kendisi hariç)
        var codeExists = await _context.ExpenseCategories
            .AnyAsync(c => c.CompanyId == companyId && c.Code == request.Code && c.Id != request.Id, cancellationToken);

        if (codeExists)
            return Result<ExpenseCategoryDto>.Fail("Bu kod zaten kullanılıyor");

        // Parent category kontrolü (döngüsel referans önleme)
        if (request.ParentCategoryId.HasValue)
        {
            if (request.ParentCategoryId.Value == request.Id)
                return Result<ExpenseCategoryDto>.Fail("Kategori kendi üst kategorisi olamaz");

            var parentExists = await _context.ExpenseCategories
                .AnyAsync(c => c.Id == request.ParentCategoryId.Value && c.CompanyId == companyId, cancellationToken);

            if (!parentExists)
                return Result<ExpenseCategoryDto>.Fail("Üst kategori bulunamadı");
        }

        category.Code = request.Code;
        category.Name = request.Name;
        category.Description = request.Description;
        category.ParentCategoryId = request.ParentCategoryId;
        category.MonthlyBudget = request.MonthlyBudget;
        category.Currency = request.Currency;
        category.ColorCode = request.ColorCode;
        category.IsActive = request.IsActive;
        category.DisplayOrder = request.DisplayOrder;
        category.UpdatedAt = DateTime.UtcNow;
        category.UpdatedBy = _currentUser.UserId ?? Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = await MapToDtoAsync(category.Id, cancellationToken);
        return Result<ExpenseCategoryDto>.Ok(dto!);
    }

    private async Task<ExpenseCategoryDto?> MapToDtoAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.ExpenseCategories
            .Where(c => c.Id == id)
            .Select(c => new ExpenseCategoryDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                Code = c.Code,
                Name = c.Name,
                Description = c.Description,
                ParentCategoryId = c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory != null ? c.ParentCategory.Name : null,
                MonthlyBudget = c.MonthlyBudget,
                Currency = c.Currency,
                ColorCode = c.ColorCode,
                IsActive = c.IsActive,
                DisplayOrder = c.DisplayOrder,
                SubCategoryCount = c.SubCategories.Count,
                ExpenseCount = c.Expenses.Count
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}

