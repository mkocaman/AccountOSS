using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Commands.MarkAsRead;

public class MarkNotificationAsReadCommandHandler 
    : IRequestHandler<MarkNotificationAsReadCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkNotificationAsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        MarkNotificationAsReadCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var notification = await _context.Notifications
            .Where(n => n.Id == request.NotificationId && n.UserId == _currentUser.UserId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (notification == null)
            return Result<bool>.Fail("Bildirim bulunamadı");

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<bool>.Ok(true);
    }
}

