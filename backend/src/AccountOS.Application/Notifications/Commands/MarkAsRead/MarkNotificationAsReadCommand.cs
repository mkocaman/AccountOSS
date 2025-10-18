using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Notifications.Commands.MarkAsRead;

public record MarkNotificationAsReadCommand(Guid NotificationId) : IRequest<Result<bool>>;

