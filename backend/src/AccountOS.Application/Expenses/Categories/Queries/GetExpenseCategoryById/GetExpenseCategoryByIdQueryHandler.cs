using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategoryById;

public class GetExpenseCategoryByIdQueryHandler 
    : IRequestHandler<GetExpenseCategoryByIdQuery, Result<ExpenseCategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetExpenseCategoryByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ExpenseCategoryDto>> Handle(
        GetExpenseCategoryByIdQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ExpenseCategoryDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var category = await _context.ExpenseCategories
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
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

        if (category == null)
            return Result<ExpenseCategoryDto>.Fail("Kategori bulunamadı");

        return Result<ExpenseCategoryDto>.Ok(category);
    }
}

