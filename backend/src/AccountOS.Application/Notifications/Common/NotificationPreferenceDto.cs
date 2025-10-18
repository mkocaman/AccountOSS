using AccountOS.Domain.Enums;

namespace AccountOS.Application.Notifications.Common;

public record NotificationPreferenceDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public NotificationType NotificationType { get; init; }
    public string NotificationTypeName { get; init; } = string.Empty;
    public bool InAppEnabled { get; init; }
    public bool EmailEnabled { get; init; }
    public bool SmsEnabled { get; init; }
    public bool PushEnabled { get; init; }
    public NotificationPriority MinimumPriority { get; init; }
    public string MinimumPriorityName { get; init; } = string.Empty;
    public string? QuietHoursStart { get; init; }
    public string? QuietHoursEnd { get; init; }
}

