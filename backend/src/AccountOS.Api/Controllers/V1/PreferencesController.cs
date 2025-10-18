using AccountOS.Api.Controllers;
using AccountOS.Application.Preferences.Commands.DeleteDashboardWidget;
using AccountOS.Application.Preferences.Commands.SaveDashboardWidget;
using AccountOS.Application.Preferences.Commands.UpdateCompanySettings;
using AccountOS.Application.Preferences.Commands.UpdateUserPreference;
using AccountOS.Application.Preferences.Queries.GetCompanySettings;
using AccountOS.Application.Preferences.Queries.GetDashboardWidgets;
using AccountOS.Application.Preferences.Queries.GetUserPreference;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Kullanıcı ve şirket tercihleri
/// </summary>
[Authorize]
public class PreferencesController : BaseApiController
{
    /// <summary>
    /// Kullanıcı tercihlerini getir
    /// </summary>
    [HttpGet("user")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Preferences.Common.UserPreferenceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserPreference()
    {
        var result = await Mediator.Send(new GetUserPreferenceQuery());
        return Ok(result);
    }

    /// <summary>
    /// Kullanıcı tercihlerini güncelle
    /// </summary>
    [HttpPut("user")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Preferences.Common.UserPreferenceDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateUserPreference([FromBody] UpdateUserPreferenceCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Şirket ayarlarını getir
    /// </summary>
    [HttpGet("company")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Preferences.Common.CompanySettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCompanySettings()
    {
        var result = await Mediator.Send(new GetCompanySettingsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Şirket ayarlarını güncelle (admin)
    /// </summary>
    [HttpPut("company")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Preferences.Common.CompanySettingsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateCompanySettings([FromBody] UpdateCompanySettingsCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Dashboard widget'ları getir
    /// </summary>
    [HttpGet("dashboard/widgets")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Preferences.Common.DashboardWidgetDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardWidgets()
    {
        var result = await Mediator.Send(new GetDashboardWidgetsQuery());
        return Ok(result);
    }

    /// <summary>
    /// Dashboard widget kaydet
    /// </summary>
    [HttpPost("dashboard/widgets")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Preferences.Common.DashboardWidgetDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SaveDashboardWidget([FromBody] SaveDashboardWidgetCommand command)
    {
        var result = await Mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Dashboard widget sil
    /// </summary>
    [HttpDelete("dashboard/widgets/{id}")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteDashboardWidget(Guid id)
    {
        var result = await Mediator.Send(new DeleteDashboardWidgetCommand(id));
        return Ok(result);
    }
}

