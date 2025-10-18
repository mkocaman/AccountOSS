using AccountOS.Application.Common;
using AccountOS.Application.Notifications.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Notifications.Commands.SavePreference;

public record SaveNotificationPreferenceCommand : IRequest<Result<NotificationPreferenceDto>>
{
    public NotificationType NotificationType { get; init; }
    public bool InAppEnabled { get; init; } = true;
    public bool EmailEnabled { get; init; } = true;
    public bool SmsEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public NotificationPriority MinimumPriority { get; init; } = NotificationPriority.Low;
    public string? QuietHoursStart { get; init; }
    public string? QuietHoursEnd { get; init; }
}

