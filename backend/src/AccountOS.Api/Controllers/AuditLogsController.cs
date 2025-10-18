using AccountOS.Api.Controllers;
using AccountOS.Application.AuditLogs.Queries.GetAuditLogs;
using AccountOS.Application.AuditLogs.Queries.GetEntityHistory;
using AccountOS.Application.AuditLogs.Queries.GetUserActivity;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Audit log yönetimi
/// </summary>
[Authorize]
public class AuditLogsController : BaseApiController
{
    /// <summary>
    /// Tüm audit logları getir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.AuditLogs.Common.AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] AuditAction? action = null,
        [FromQuery] string? entityType = null,
        [FromQuery] string? entityId = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetAuditLogsQuery
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            UserId = userId,
            StartDate = startDate,
            EndDate = endDate,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }

    /// <summary>
    /// Entity geçmişini getir
    /// </summary>
    [HttpGet("entity-history")]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.AuditLogs.Common.AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEntityHistory(
        [FromQuery] string entityType,
        [FromQuery] string entityId)
    {
        var result = await Mediator.Send(new GetEntityHistoryQuery
        {
            EntityType = entityType,
            EntityId = entityId
        });

        return Ok(result);
    }

    /// <summary>
    /// Kullanıcı aktivitelerini getir
    /// </summary>
    [HttpGet("user-activity")]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.AuditLogs.Common.AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserActivity(
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetUserActivityQuery
        {
            UserId = userId,
            StartDate = startDate,
            EndDate = endDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }
}

