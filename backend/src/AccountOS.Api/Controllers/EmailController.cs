using AccountOS.Api.Controllers;
using AccountOS.Application.Email.Commands.SendInvoiceEmail;
using AccountOS.Application.Email.Commands.SendPaymentReminder;
using AccountOS.Application.Email.Queries.GetEmailLogs;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Email gönderim ve log yönetimi
/// </summary>
[Authorize]
public class EmailController : BaseApiController
{
    /// <summary>
    /// Fatura email'i gönder
    /// </summary>
    [HttpPost("send-invoice")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendInvoiceEmail([FromBody] SendInvoiceEmailCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Ödeme hatırlatması gönder
    /// </summary>
    [HttpPost("send-payment-reminder")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendPaymentReminder([FromBody] SendPaymentReminderCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Email loglarını getir
    /// </summary>
    [HttpGet("logs")]
    [ProducesResponseType(typeof(Application.Common.Result<List<EmailLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmailLogs(
        [FromQuery] EmailStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetEmailLogsQuery
        {
            Status = status,
            StartDate = startDate,
            EndDate = endDate,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }
}

