using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Expenses.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategories;

public class GetExpenseCategoriesQueryHandler 
    : IRequestHandler<GetExpenseCategoriesQuery, Result<List<ExpenseCategoryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetExpenseCategoriesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ExpenseCategoryDto>>> Handle(
        GetExpenseCategoriesQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<ExpenseCategoryDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.ExpenseCategories
            .Where(c => c.CompanyId == companyId);

        if (request.IsActive.HasValue)
            query = query.Where(c => c.IsActive == request.IsActive.Value);

        if (request.ParentCategoryId.HasValue)
            query = query.Where(c => c.ParentCategoryId == request.ParentCategoryId.Value);

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
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
            .ToListAsync(cancellationToken);

        return Result<List<ExpenseCategoryDto>>.Ok(categories);
    }
}

