using AccountOS.Application.Common;
using AccountOS.Application.Security.Commands.CreateApiKey;
using AccountOS.Application.Security.Commands.DisableTwoFactor;
using AccountOS.Application.Security.Commands.EnableTwoFactor;
using AccountOS.Application.Security.Commands.GenerateBackupCodes;
using AccountOS.Application.Security.Commands.RevokeApiKey;
using AccountOS.Application.Security.Commands.VerifyTwoFactor;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Güvenlik ayarları
/// </summary>
[Authorize]
[Route("api/v1/[controller]")]
[ApiController]
public class SecurityController : ControllerBase
{
    private readonly IMediator _mediator;

    public SecurityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// 2FA'yı etkinleştir
    /// </summary>
    [HttpPost("2fa/enable")]
    [ProducesResponseType(typeof(Result<Enable2FaResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> EnableTwoFactor()
    {
        var result = await _mediator.Send(new EnableTwoFactorCommand());
        return Ok(result);
    }

    /// <summary>
    /// 2FA'yı devre dışı bırak
    /// </summary>
    [HttpPost("2fa/disable")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> DisableTwoFactor()
    {
        var result = await _mediator.Send(new DisableTwoFactorCommand());
        return Ok(result);
    }

    /// <summary>
    /// 2FA kodunu doğrula
    /// </summary>
    [HttpPost("2fa/verify")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyTwoFactor([FromBody] VerifyTwoFactorCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// Yeni backup kodları oluştur
    /// </summary>
    [HttpPost("2fa/backup-codes")]
    [ProducesResponseType(typeof(Result<string[]>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GenerateBackupCodes()
    {
        var result = await _mediator.Send(new GenerateBackupCodesCommand());
        return Ok(result);
    }

    /// <summary>
    /// API key oluştur
    /// </summary>
    [HttpPost("api-keys")]
    [ProducesResponseType(typeof(Result<CreateApiKeyResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateApiKey([FromBody] CreateApiKeyCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    /// <summary>
    /// API key'i iptal et
    /// </summary>
    [HttpPost("api-keys/{id}/revoke")]
    [ProducesResponseType(typeof(Result<bool>), StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeApiKey(Guid id)
    {
        var result = await _mediator.Send(new RevokeApiKeyCommand(id));
        return Ok(result);
    }
}

