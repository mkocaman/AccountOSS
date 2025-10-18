using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Commands.MarkAllAsRead;

public class MarkAllNotificationsAsReadCommandHandler 
    : IRequestHandler<MarkAllNotificationsAsReadCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public MarkAllNotificationsAsReadCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<int>> Handle(
        MarkAllNotificationsAsReadCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<int>.Fail("Kullanıcı bilgisi bulunamadı");

        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == _currentUser.UserId.Value && !n.IsRead)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;
        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
            notification.ReadAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<int>.Ok(unreadNotifications.Count);
    }
}

