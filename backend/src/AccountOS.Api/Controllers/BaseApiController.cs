using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Tüm API controller'ların base class'ı
/// MediatR ve ortak response metodları içerir
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
public abstract class BaseApiController : ControllerBase
{
    private IMediator? _mediator;

    /// <summary>
    /// MediatR instance - Lazy loading
    /// </summary>
    protected IMediator Mediator => 
        _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();

    /// <summary>
    /// Result pattern'den API response'a dönüştürür
    /// </summary>
    protected IActionResult FromResult<T>(AccountOS.Application.Common.Result<T> result)
    {
        if (result.Success)
        {
            return Ok(new { success = true, data = result.Value });
        }

        return BadRequest(new { success = false, message = result.Error });
    }

    /// <summary>
    /// Result pattern'den API response'a dönüştürür (veri yok)
    /// </summary>
    protected IActionResult FromResult(AccountOS.Application.Common.Result result)
    {
        if (result.Success)
        {
            return Ok(new { success = true });
        }

        return BadRequest(new { success = false, message = result.Error });
    }

    /// <summary>
    /// Başarılı response (veri ile)
    /// </summary>
    protected IActionResult Success<T>(T data, string? message = null)
    {
        return Ok(new
        {
            success = true,
            message = message ?? "İşlem başarılı",
            data
        });
    }

    /// <summary>
    /// Başarılı response (veri yok)
    /// </summary>
    protected IActionResult Success(string? message = null)
    {
        return Ok(new
        {
            success = true,
            message = message ?? "İşlem başarılı"
        });
    }

    /// <summary>
    /// Hata response
    /// </summary>
    protected IActionResult Error(string message, int statusCode = 400)
    {
        return StatusCode(statusCode, new
        {
            success = false,
            message
        });
    }
}

