using Microsoft.AspNetCore.Mvc;
using AccountOS.Application.Features.Authentication.Commands.Register;
using AccountOS.Application.Features.Authentication.Commands.Login;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Authentication controller
/// </summary>
public class AuthController : BaseApiController
{
    /// <summary>
    /// Kayıt ol
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        return FromResult(result);
    }

    /// <summary>
    /// Giriş yap
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        return FromResult(result);
    }
}

