using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Commands.RejectExpense;

public class RejectExpenseCommandHandler 
    : IRequestHandler<RejectExpenseCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public RejectExpenseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<Result<bool>> Handle(
        RejectExpenseCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var expense = await _context.Expenses
            .Where(e => e.Id == request.ExpenseId && e.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (expense == null)
            return Result<bool>.Fail("Gider bulunamadı");

        if (expense.Status == ExpenseStatus.Paid)
            return Result<bool>.Fail("Ödenmiş gider reddedilemez");

        if (expense.Status == ExpenseStatus.Cancelled)
            return Result<bool>.Fail("İptal edilmiş gider reddedilemez");

        if (string.IsNullOrWhiteSpace(request.RejectionReason))
            return Result<bool>.Fail("Red nedeni belirtilmeli");

        expense.ApprovalStatus = ExpenseApprovalStatus.Rejected;
        expense.Status = ExpenseStatus.Rejected;
        expense.ApprovedBy = _currentUser.UserId.Value;
        expense.ApprovedAt = DateTime.UtcNow;
        expense.RejectionReason = request.RejectionReason;
        expense.UpdatedAt = DateTime.UtcNow;
        expense.UpdatedBy = _currentUser.UserId.Value;

        await _context.SaveChangesAsync(cancellationToken);

        // Send notification to expense creator
        await _notificationService.SendExpenseRejectedNotificationAsync(
            expense.CreatedBy,
            expense.Id,
            expense.Title,
            "Yönetici",
            request.RejectionReason,
            cancellationToken);

        return Result<bool>.Ok(true);
    }
}

