using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Notifications.Queries.GetUnreadCount;

public record GetUnreadNotificationCountQuery : IRequest<Result<int>>;

