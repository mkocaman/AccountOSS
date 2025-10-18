using AccountOS.Application.Common;
using AccountOS.Application.Notifications.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery : IRequest<Result<List<NotificationDto>>>
{
    public bool? IsRead { get; init; }
    public NotificationType? Type { get; init; }
    public NotificationPriority? Priority { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

