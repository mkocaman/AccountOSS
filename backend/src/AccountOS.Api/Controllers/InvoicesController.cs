using AccountOS.Api.Controllers;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Commands.CancelInvoice;
using AccountOS.Application.Invoices.Commands.CreateInvoice;
using AccountOS.Application.Invoices.Commands.IssueInvoice;
using AccountOS.Application.Invoices.Queries.GetInvoiceById;
using AccountOS.Application.Invoices.Queries.GetInvoices;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Fatura yönetimi (Alış/Satış)
/// </summary>
[Authorize]
public class InvoicesController : BaseApiController
{
    /// <summary>
    /// Faturaları listele
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.Invoices.Common.InvoiceDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetInvoices(
        [FromQuery] InvoiceType? type = null,
        [FromQuery] Guid? customerId = null,
        [FromQuery] InvoiceStatus? status = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? searchTerm = null)
    {
        var result = await Mediator.Send(new GetInvoicesQuery
        {
            Type = type,
            CustomerId = customerId,
            Status = status,
            StartDate = startDate,
            EndDate = endDate,
            SearchTerm = searchTerm
        });

        return Ok(result);
    }

    /// <summary>
    /// ID'ye göre fatura detayı getir
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Invoices.Common.InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetInvoiceById(Guid id)
    {
        var result = await Mediator.Send(new GetInvoiceByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Yeni fatura oluştur (Draft durumunda)
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Invoices.Common.InvoiceDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(
            nameof(GetInvoiceById),
            new { id = result.Data!.Id },
            result);
    }

    /// <summary>
    /// Fatura kes (Draft → Issued + Stok hareketi)
    /// </summary>
    [HttpPost("{id:guid}/issue")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Invoices.Common.InvoiceDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> IssueInvoice(Guid id)
    {
        var result = await Mediator.Send(new IssueInvoiceCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Fatura iptal et
    /// </summary>
    [HttpPost("{id:guid}/cancel")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CancelInvoice(Guid id)
    {
        var result = await Mediator.Send(new CancelInvoiceCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Fatura PDF'i indir
    /// </summary>
    [HttpGet("{id:guid}/pdf")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DownloadInvoicePdf(Guid id, [FromServices] IPdfService pdfService)
    {
        var result = await Mediator.Send(new GetInvoiceByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        var pdfBytes = pdfService.GenerateInvoicePdf(result.Data!);

        return File(pdfBytes, "application/pdf", $"{result.Data!.InvoiceNumber}.pdf");
    }
}
