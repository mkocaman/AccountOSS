using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Categories.Commands.CreateExpenseCategory;

public class CreateExpenseCategoryCommandHandler 
    : IRequestHandler<CreateExpenseCategoryCommand, Result<ExpenseCategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateExpenseCategoryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ExpenseCategoryDto>> Handle(
        CreateExpenseCategoryCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseCategoryDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Kod benzersizliği kontrolü
        var codeExists = await _context.ExpenseCategories
            .AnyAsync(c => c.CompanyId == companyId && c.Code == request.Code, cancellationToken);

        if (codeExists)
            return Result<ExpenseCategoryDto>.Fail("Bu kod zaten kullanılıyor");

        // Parent category kontrolü
        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await _context.ExpenseCategories
                .AnyAsync(c => c.Id == request.ParentCategoryId.Value && c.CompanyId == companyId, cancellationToken);

            if (!parentExists)
                return Result<ExpenseCategoryDto>.Fail("Üst kategori bulunamadı");
        }

        var category = new ExpenseCategory
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            ParentCategoryId = request.ParentCategoryId,
            MonthlyBudget = request.MonthlyBudget,
            Currency = request.Currency,
            ColorCode = request.ColorCode,
            IsActive = true,
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.ExpenseCategories.Add(category);
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

