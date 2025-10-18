using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.AuditLogs.Queries.GetEntityHistory;

/// <summary>
/// Belirli bir entity'nin geçmişini getir
/// </summary>
public record GetEntityHistoryQuery : IRequest<Result<List<AuditLogDto>>>
{
    public string EntityType { get; init; } = string.Empty;
    public string EntityId { get; init; } = string.Empty;
}

