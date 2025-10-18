using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Notifications.Commands.MarkAllAsRead;

public record MarkAllNotificationsAsReadCommand : IRequest<Result<int>>;

