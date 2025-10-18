using AccountOS.Application.Currencies.Commands.CreateCurrency;
using AccountOS.Application.Currencies.Commands.CreateFxRate;
using AccountOS.Application.Currencies.Queries.GetCurrencies;
using AccountOS.Application.Currencies.Queries.GetCurrentRate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Para birimi ve döviz kuru yönetimi
/// </summary>
[Authorize]
public class CurrenciesController : BaseApiController
{
    /// <summary>
    /// Para birimlerini listele
    /// </summary>
    /// <param name="activeOnly">Sadece aktif para birimlerini getir</param>
    /// <returns>Para birimi listesi</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrencies([FromQuery] bool activeOnly = true)
    {
        var result = await Mediator.Send(new GetCurrenciesQuery { ActiveOnly = activeOnly });
        return FromResult(result);
    }

    /// <summary>
    /// Yeni para birimi oluştur (Admin only)
    /// </summary>
    /// <param name="command">Para birimi bilgileri</param>
    /// <returns>Oluşturulan para birimi</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCurrency([FromBody] CreateCurrencyCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(nameof(GetCurrencies), new { success = true, data = result.Data });
    }

    /// <summary>
    /// Yeni döviz kuru ekle veya güncelle
    /// </summary>
    /// <param name="command">Döviz kuru bilgileri</param>
    /// <returns>Oluşturulan/güncellenen kur</returns>
    [HttpPost("fx-rates")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateFxRate([FromBody] CreateFxRateCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(nameof(GetCurrentRate), 
            new { baseCurrency = command.BaseCurrencyCode, quoteCurrency = command.QuoteCurrencyCode }, 
            new { success = true, data = result.Data });
    }

    /// <summary>
    /// Belirli bir tarih için güncel kuru getir
    /// </summary>
    /// <param name="baseCurrency">Baz para birimi (örn: USD)</param>
    /// <param name="quoteCurrency">Hedef para birimi (örn: TRY)</param>
    /// <param name="asOfDate">Tarih (opsiyonel, default: bugün)</param>
    /// <returns>Kur değeri</returns>
    [HttpGet("fx-rates/{baseCurrency}/{quoteCurrency}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentRate(
        string baseCurrency, 
        string quoteCurrency,
        [FromQuery] DateTime? asOfDate = null)
    {
        var result = await Mediator.Send(new GetCurrentRateQuery 
        { 
            BaseCurrencyCode = baseCurrency, 
            QuoteCurrencyCode = quoteCurrency,
            AsOfDate = asOfDate 
        });
        
        if (!result.Success)
            return NotFound(result);
        
        return FromResult(result);
    }
}

