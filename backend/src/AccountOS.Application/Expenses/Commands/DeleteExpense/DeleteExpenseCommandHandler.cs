using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Commands.DeleteExpense;

public class DeleteExpenseCommandHandler 
    : IRequestHandler<DeleteExpenseCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteExpenseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        DeleteExpenseCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<bool>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var expense = await _context.Expenses
            .Where(e => e.Id == request.Id && e.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (expense == null)
            return Result<bool>.Fail("Gider bulunamadı");

        // Ödenmiş giderler silinemez
        if (expense.Status == ExpenseStatus.Paid)
            return Result<bool>.Fail("Ödenmiş gider silinemez");

        // Soft delete
        expense.IsDeleted = true;
        expense.DeletedAt = DateTime.UtcNow;
        expense.DeletedBy = _currentUser.UserId ?? Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

