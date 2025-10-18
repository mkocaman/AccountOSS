using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.AuditLogs.Queries.GetUserActivity;

/// <summary>
/// Kullanıcı aktivitelerini getir
/// </summary>
public record GetUserActivityQuery : IRequest<Result<List<AuditLogDto>>>
{
    public Guid? UserId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

