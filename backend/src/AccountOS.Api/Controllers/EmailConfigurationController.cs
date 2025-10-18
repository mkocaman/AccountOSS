using AccountOS.Api.Controllers;
using AccountOS.Application.Email.Configuration.Commands.SaveEmailConfiguration;
using AccountOS.Application.Email.Configuration.Commands.TestEmailConfiguration;
using AccountOS.Application.Email.Configuration.Queries.GetEmailConfiguration;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Email yapılandırması yönetimi
/// </summary>
[Authorize]
public class EmailConfigurationController : BaseApiController
{
    /// <summary>
    /// Email yapılandırmasını getir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Email.Configuration.Common.EmailConfigurationDto?>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConfiguration()
    {
        var result = await Mediator.Send(new GetEmailConfigurationQuery());
        return Ok(result);
    }

    /// <summary>
    /// Email yapılandırması kaydet/güncelle
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Email.Configuration.Common.EmailConfigurationDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SaveConfiguration([FromBody] SaveEmailConfigurationCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Email yapılandırmasını test et
    /// </summary>
    [HttpPost("test")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> TestConfiguration([FromBody] TestEmailConfigurationCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

