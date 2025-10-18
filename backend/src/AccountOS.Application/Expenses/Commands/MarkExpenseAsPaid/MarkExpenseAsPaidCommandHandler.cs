using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Commands.MarkExpenseAsPaid;

public class MarkExpenseAsPaidCommandHandler 
    : IRequestHandler<MarkExpenseAsPaidCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkExpenseAsPaidCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        MarkExpenseAsPaidCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<bool>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var expense = await _context.Expenses
            .Where(e => e.Id == request.ExpenseId && e.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (expense == null)
            return Result<bool>.Fail("Gider bulunamadı");

        if (expense.Status == ExpenseStatus.Paid)
            return Result<bool>.Fail("Gider zaten ödendi olarak işaretli");

        if (expense.Status == ExpenseStatus.Cancelled)
            return Result<bool>.Fail("İptal edilmiş gider ödenemez");

        if (expense.Status == ExpenseStatus.Rejected)
            return Result<bool>.Fail("Reddedilmiş gider ödenemez");

        expense.Status = ExpenseStatus.Paid;
        expense.PaymentDate = request.PaymentDate;
        expense.UpdatedAt = DateTime.UtcNow;
        expense.UpdatedBy = _currentUser.UserId ?? Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

