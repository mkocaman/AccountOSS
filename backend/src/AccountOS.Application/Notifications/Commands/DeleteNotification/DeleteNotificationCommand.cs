using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Notifications.Commands.DeleteNotification;

public record DeleteNotificationCommand(Guid NotificationId) : IRequest<Result<bool>>;

