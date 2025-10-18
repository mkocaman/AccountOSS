using AccountOS.Domain.Enums;

namespace AccountOS.Application.AuditLogs.Common;

public record AuditLogDto
{
    public Guid Id { get; init; }
    public Guid? CompanyId { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string UserEmail { get; init; } = string.Empty;
    public AuditAction Action { get; init; }
    public string ActionName { get; init; } = string.Empty;
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
    public string? EntityName { get; init; }
    public string? OldValues { get; init; }
    public string? NewValues { get; init; }
    public string? ChangedProperties { get; init; }
    public string? Description { get; init; }
    public string? IpAddress { get; init; }
    public string? UserAgent { get; init; }
    public DateTime Timestamp { get; init; }
    public string? HttpMethod { get; init; }
    public string? RequestPath { get; init; }
    public int? StatusCode { get; init; }
    public long? Duration { get; init; }
    public string? ErrorMessage { get; init; }
}

