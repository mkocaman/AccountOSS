using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Categories.Commands.DeleteExpenseCategory;

public class DeleteExpenseCategoryCommandHandler 
    : IRequestHandler<DeleteExpenseCategoryCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteExpenseCategoryCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        DeleteExpenseCategoryCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<bool>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var category = await _context.ExpenseCategories
            .Include(c => c.SubCategories)
            .Include(c => c.Expenses)
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (category == null)
            return Result<bool>.Fail("Kategori bulunamadı");

        // Alt kategorisi varsa silinemez
        if (category.SubCategories.Any())
            return Result<bool>.Fail("Alt kategorileri olan kategori silinemez");

        // Gideri varsa silinemez
        if (category.Expenses.Any())
            return Result<bool>.Fail("Gideri olan kategori silinemez");

        // Soft delete
        category.IsDeleted = true;
        category.DeletedAt = DateTime.UtcNow;
        category.DeletedBy = _currentUser.UserId ?? Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

