using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Commands.CreateCustomer;
using AccountOS.Application.Customers.Commands.DeleteCustomer;
using AccountOS.Application.Customers.Commands.UpdateCustomer;
using AccountOS.Application.Customers.Queries.GetCustomerById;
using AccountOS.Application.Customers.Queries.GetCustomers;
using AccountOS.Application.Customers.Queries.GetCustomerStatement;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Cari hesap (müşteri/tedarikçi) yönetimi
/// </summary>
[Authorize]
public class CustomersController : BaseApiController
{
    /// <summary>
    /// Cari hesapları listele
    /// </summary>
    /// <param name="searchTerm">Arama terimi (ad, kod, email)</param>
    /// <param name="activeOnly">Sadece aktif cari hesaplar</param>
    /// <returns>Cari hesap listesi</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool activeOnly = true)
    {
        var result = await Mediator.Send(new GetCustomersQuery 
        { 
            SearchTerm = searchTerm, 
            ActiveOnly = activeOnly 
        });
        
        return FromResult(result);
    }

    /// <summary>
    /// ID'ye göre cari hesap detayı getir
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <returns>Cari hesap detayı</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCustomerById(Guid id)
    {
        var result = await Mediator.Send(new GetCustomerByIdQuery(id));
        
        if (!result.Success)
            return NotFound(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Yeni cari hesap oluştur
    /// </summary>
    /// <param name="command">Cari hesap bilgileri</param>
    /// <returns>Oluşturulan cari hesap</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(
            nameof(GetCustomerById), 
            new { id = result.Data!.Id }, 
            result);
    }

    /// <summary>
    /// Cari hesap bilgilerini güncelle
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <param name="command">Güncellenmiş cari hesap bilgileri</param>
    /// <returns>Güncellenmiş cari hesap</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Cari hesap ekstresi getir (PDF oluşturmak için)
    /// </summary>
    [HttpGet("{id:guid}/statement")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Customers.Common.CustomerStatementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCustomerStatement(
        Guid id,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] bool showInvoiceNames = true,
        [FromQuery] bool showItems = false,
        [FromQuery] bool showBankAccounts = true,
        [FromQuery] string currencies = "TRY")
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;
        
        var currencyList = currencies.Split(',').Select(c => c.Trim().ToUpper()).ToList();

        var result = await Mediator.Send(new GetCustomerStatementQuery
        {
            CustomerId = id,
            StartDate = start,
            EndDate = end,
            ShowInvoiceNames = showInvoiceNames,
            ShowItems = showItems,
            ShowBankAccounts = showBankAccounts,
            Currencies = currencyList
        });

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Cari hesabı sil (soft delete)
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <returns>Silme işlemi sonucu</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var result = await Mediator.Send(new DeleteCustomerCommand(id));
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Cari hesap ekstresi PDF'i indir
    /// </summary>
    [HttpGet("{id:guid}/statement/pdf")]
    [ProducesResponseType(typeof(FileResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DownloadStatementPdf(
        Guid id,
        [FromServices] IPdfService pdfService,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] bool showInvoiceNames = true,
        [FromQuery] bool showItems = false,
        [FromQuery] bool showBankAccounts = true,
        [FromQuery] string currencies = "TRY")
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;
        
        var currencyList = currencies.Split(',').Select(c => c.Trim().ToUpper()).ToList();

        var result = await Mediator.Send(new GetCustomerStatementQuery
        {
            CustomerId = id,
            StartDate = start,
            EndDate = end,
            ShowInvoiceNames = showInvoiceNames,
            ShowItems = showItems,
            ShowBankAccounts = showBankAccounts,
            Currencies = currencyList
        });

        if (!result.Success)
            return NotFound(result);

        var pdfBytes = pdfService.GenerateCustomerStatementPdf(result.Data!);

        var filename = $"Ekstre-{result.Data!.Customer.Code}-{start:yyyyMMdd}-{end:yyyyMMdd}.pdf";
        
        return File(pdfBytes, "application/pdf", filename);
    }
}

