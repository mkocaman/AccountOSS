using AccountOS.Api.Controllers;
using AccountOS.Application.Payments.Commands.CreatePayment;
using AccountOS.Application.Payments.Queries.GetPaymentById;
using AccountOS.Application.Payments.Queries.GetPayments;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Ödeme yönetimi
/// </summary>
[Authorize]
public class PaymentsController : BaseApiController
{
    /// <summary>
    /// Ödemeleri listele
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.Payments.Common.PaymentDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPayments(
        [FromQuery] PaymentType? type = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? invoiceId = null,
        [FromQuery] PaymentMethod? method = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? searchTerm = null)
    {
        var result = await Mediator.Send(new GetPaymentsQuery
        {
            Type = type,
            CustomerId = customerId,
            InvoiceId = invoiceId,
            Method = method,
            StartDate = startDate,
            EndDate = endDate,
            SearchTerm = searchTerm
        });

        return Ok(result);
    }

    /// <summary>
    /// ID'ye göre ödeme detayı getir
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Payments.Common.PaymentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetPaymentById(Guid id)
    {
        var result = await Mediator.Send(new GetPaymentByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Ödeme kaydet
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Payments.Common.PaymentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(
            nameof(GetPaymentById),
            new { id = result.Data!.Id },
            result);
    }
}

