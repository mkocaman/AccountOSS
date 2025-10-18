using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Commands.DeleteNotification;

public class DeleteNotificationCommandHandler 
    : IRequestHandler<DeleteNotificationCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteNotificationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        DeleteNotificationCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var notification = await _context.Notifications
            .Where(n => n.Id == request.NotificationId && n.UserId == _currentUser.UserId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (notification == null)
            return Result<bool>.Fail("Bildirim bulunamadı");

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

