using AccountOS.Domain.Enums;

namespace AccountOS.Application.Notifications.Common;

public record NotificationDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public Guid UserId { get; init; }
    public NotificationType Type { get; init; }
    public string TypeName { get; init; } = string.Empty;
    public NotificationPriority Priority { get; init; }
    public string PriorityName { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string? EntityType { get; init; }
    public Guid? EntityId { get; init; }
    public string? EntityName { get; init; }
    public string? ActionUrl { get; init; }
    public string? Icon { get; init; }
    public string? Color { get; init; }
    public bool IsRead { get; init; }
    public DateTime? ReadAt { get; init; }
    public bool EmailSent { get; init; }
    public DateTime? EmailSentAt { get; init; }
    public DateTime CreatedAt { get; init; }
    public string TimeAgo { get; init; } = string.Empty;
}

