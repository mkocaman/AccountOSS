using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Expenses.Commands.ApproveExpense;

public class ApproveExpenseCommandHandler 
    : IRequestHandler<ApproveExpenseCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public ApproveExpenseCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        INotificationService notificationService)
    {
        _context = context;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    public async Task<Result<bool>> Handle(
        ApproveExpenseCommand request, 
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

        if (expense.ApprovalStatus == ExpenseApprovalStatus.Approved)
            return Result<bool>.Fail("Gider zaten onaylanmış");

        if (expense.Status == ExpenseStatus.Paid)
            return Result<bool>.Fail("Ödenmiş gider onaylanamaz");

        if (expense.Status == ExpenseStatus.Cancelled)
            return Result<bool>.Fail("İptal edilmiş gider onaylanamaz");

        expense.ApprovalStatus = ExpenseApprovalStatus.Approved;
        expense.Status = ExpenseStatus.Approved;
        expense.ApprovedBy = _currentUser.UserId.Value;
        expense.ApprovedAt = DateTime.UtcNow;
        expense.RejectionReason = null;
        expense.UpdatedAt = DateTime.UtcNow;
        expense.UpdatedBy = _currentUser.UserId.Value;

        await _context.SaveChangesAsync(cancellationToken);

        // Send notification to expense creator
        await _notificationService.SendExpenseApprovedNotificationAsync(
            expense.CreatedBy,
            expense.Id,
            expense.Title,
            "Yönetici",
            cancellationToken);

        return Result<bool>.Ok(true);
    }
}

