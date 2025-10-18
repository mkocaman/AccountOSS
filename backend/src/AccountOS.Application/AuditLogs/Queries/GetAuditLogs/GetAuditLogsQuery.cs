using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<Result<List<AuditLogDto>>>
{
    public AuditAction? Action { get; init; }
    public string? EntityType { get; init; }
    public string? EntityId { get; init; }
    public Guid? UserId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

