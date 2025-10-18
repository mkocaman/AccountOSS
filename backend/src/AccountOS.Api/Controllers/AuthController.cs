using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AccountOS.Application.Features.Authentication.Commands.Register;
using AccountOS.Application.Features.Authentication.Commands.Login;
using System.Security.Claims;

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

    /// <summary>
    /// Test endpoint: JWT claims doğrulaması (Prompt 1.12 Verification)
    /// </summary>
    /// <returns>JWT claim bilgileri</returns>
    [HttpGet("test/jwt-verification")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult VerifyJwtClaims()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var companyId = User.FindFirst("CompanyId")?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        
        return Ok(new
        {
            Success = !string.IsNullOrEmpty(companyId),
            UserId = userId,
            Email = email,
            CompanyId = companyId,
            CompanyIdExists = !string.IsNullOrEmpty(companyId),
            Roles = roles,
            AllClaims = User.Claims.Select(c => new { c.Type, c.Value }).ToList(),
            Message = !string.IsNullOrEmpty(companyId)
                ? "✅ JWT verification successful! CompanyId claim found."
                : "⚠️ Warning: CompanyId claim is missing in JWT!"
        });
    }
}

