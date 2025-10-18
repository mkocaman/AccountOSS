using AccountOS.Api.Controllers;
using AccountOS.Application.Accounting.Commands.CreateJournalEntry;
using AccountOS.Application.Accounting.Commands.CreateTaxRate;
using AccountOS.Application.Accounting.Commands.DeleteTaxRate;
using AccountOS.Application.Accounting.Commands.InitializeChartOfAccounts;
using AccountOS.Application.Accounting.Commands.UpdateTaxRate;
using AccountOS.Application.Accounting.Queries.GetChartOfAccounts;
using AccountOS.Application.Accounting.Queries.GetTaxRateById;
using AccountOS.Application.Accounting.Queries.GetTaxRates;
using AccountOS.Application.Accounting.Queries.GetTrialBalance;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Muhasebe ve vergi
/// </summary>
[Authorize]
public class AccountingController : BaseApiController
{
    /// <summary>
    /// Hesap planını başlat (standart Türk hesap planı)
    /// </summary>
    [HttpPost("chart-of-accounts/initialize")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> InitializeChartOfAccounts()
    {
        var result = await Mediator.Send(new InitializeChartOfAccountsCommand());
        return Ok(result);
    }

    /// <summary>
    /// Hesap planını getir
    /// </summary>
    [HttpGet("chart-of-accounts")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Accounting.Common.ChartOfAccountDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetChartOfAccounts(
        [FromQuery] AccountType? accountType = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await Mediator.Send(new GetChartOfAccountsQuery
        {
            AccountType = accountType,
            IsActive = isActive
        });

        return Ok(result);
    }

    /// <summary>
    /// Yevmiye kaydı oluştur
    /// </summary>
    [HttpPost("journal-entries")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Accounting.Common.JournalEntryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateJournalEntry([FromBody] CreateJournalEntryCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Mizan raporu
    /// </summary>
    [HttpGet("trial-balance")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Accounting.Common.TrialBalanceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTrialBalance(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var result = await Mediator.Send(new GetTrialBalanceQuery
        {
            StartDate = startDate,
            EndDate = endDate
        });

        return Ok(result);
    }

    /// <summary>
    /// Vergi oranlarını getir
    /// </summary>
    [HttpGet("tax-rates")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Accounting.Common.TaxRateDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTaxRates(
        [FromQuery] TaxType? taxType = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] DateTime? effectiveDate = null)
    {
        var result = await Mediator.Send(new GetTaxRatesQuery
        {
            TaxType = taxType,
            IsActive = isActive,
            EffectiveDate = effectiveDate
        });

        return Ok(result);
    }

    /// <summary>
    /// Vergi oranını ID ile getir
    /// </summary>
    [HttpGet("tax-rates/{id}")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Accounting.Common.TaxRateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTaxRateById(Guid id)
    {
        var result = await Mediator.Send(new GetTaxRateByIdQuery(id));
        return Ok(result);
    }

    /// <summary>
    /// Yeni vergi oranı oluştur
    /// </summary>
    [HttpPost("tax-rates")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Accounting.Common.TaxRateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateTaxRate([FromBody] CreateTaxRateCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Vergi oranını güncelle
    /// </summary>
    [HttpPut("tax-rates/{id}")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Accounting.Common.TaxRateDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateTaxRate(Guid id, [FromBody] UpdateTaxRateCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Vergi oranını sil
    /// </summary>
    [HttpDelete("tax-rates/{id}")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteTaxRate(Guid id)
    {
        var result = await Mediator.Send(new DeleteTaxRateCommand(id));
        return Ok(result);
    }
}

