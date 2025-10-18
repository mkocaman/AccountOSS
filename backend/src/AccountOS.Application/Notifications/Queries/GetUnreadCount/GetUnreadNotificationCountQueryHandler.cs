using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Queries.GetUnreadCount;

public class GetUnreadNotificationCountQueryHandler 
    : IRequestHandler<GetUnreadNotificationCountQuery, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUnreadNotificationCountQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<int>> Handle(
        GetUnreadNotificationCountQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<int>.Fail("Kullanıcı bilgisi bulunamadı");

        var count = await _context.Notifications
            .Where(n => n.UserId == _currentUser.UserId.Value 
                     && !n.IsRead
                     && (n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow))
            .CountAsync(cancellationToken);

        return Result<int>.Ok(count);
    }
}

