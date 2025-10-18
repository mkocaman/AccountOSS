using AccountOS.Application.Common;
using AccountOS.Application.Notifications.Commands.DeleteNotification;
using AccountOS.Application.Notifications.Commands.MarkAllAsRead;
using AccountOS.Application.Notifications.Commands.MarkAsRead;
using AccountOS.Application.Notifications.Commands.SavePreference;
using AccountOS.Application.Notifications.Queries.GetNotifications;
using AccountOS.Application.Notifications.Queries.GetPreferences;
using AccountOS.Application.Notifications.Queries.GetUnreadCount;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Bildirimler
/// </summary>
[Authorize]
[Route("api/v1/[controller]")]
[ApiController]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Bildirimleri getir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<List<Application.Notifications.Common.NotificationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool? isRead = null,
        [FromQuery] NotificationType? type = null,
        [FromQuery] NotificationPriority? priority = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _mediator.Send(new GetNotificationsQuery
        {
            IsRead = isRead,
            Type = type,
            Priority = priority,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }

    /// <summary>
    /// Okunmamış bildirim sayısı
    /// </summary>
    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(Result<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUnreadCount()
    {
        var result = await _mediator.Send(new GetUnreadNotificationCountQuery());
        return Ok(result);
    }

    /// <summary>
    /// Bildirimi okundu olarak işaretle
    /// </summary>
    [HttpPost("{id}/mark-as-read")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAsRead(Guid id)
    {
        var result = await _mediator.Send(new MarkNotificationAsReadCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// Tüm bildirimleri okundu olarak işaretle
    /// </summary>
    [HttpPost("mark-all-as-read")]
    [ProducesResponseType(typeof(Result<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var result = await _mediator.Send(new MarkAllNotificationsAsReadCommand());
        return Ok(result);
    }

    /// <summary>
    /// Bildirimi sil
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteNotification(Guid id)
    {
        var result = await _mediator.Send(new DeleteNotificationCommand(id));
        return Ok(result);
    }

    /// <summary>
    /// Bildirim tercihlerini getir
    /// </summary>
    [HttpGet("preferences")]
    [ProducesResponseType(typeof(Result<List<Application.Notifications.Common.NotificationPreferenceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPreferences()
    {
        var result = await _mediator.Send(new GetNotificationPreferencesQuery());
        return Ok(result);
    }

    /// <summary>
    /// Bildirim tercihini kaydet
    /// </summary>
    [HttpPost("preferences")]
    [ProducesResponseType(typeof(Result<Application.Notifications.Common.NotificationPreferenceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SavePreference([FromBody] SaveNotificationPreferenceCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
}
