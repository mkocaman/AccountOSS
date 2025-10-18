using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountOS.Application.Features.Sample.Commands.CreateSample;
using AccountOS.Application.Features.Sample.Queries.GetSample;
using AccountOS.Application.Common;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Örnek controller - CQRS pattern testi için
/// </summary>
public class SampleController : BaseApiController
{
    /// <summary>
    /// Sample oluşturur
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSampleCommand command)
    {
        var result = await Mediator.Send(command);
        return FromResult(result);
    }

    /// <summary>
    /// Sample getirir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var query = new GetSampleQuery { Id = id };
        var result = await Mediator.Send(query);
        return FromResult(result);
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Success(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            version = "1.0.0"
        });
    }

    /// <summary>
    /// Veritabanı bağlantısını test eder
    /// </summary>
    [HttpGet("db-test")]
    public async Task<IActionResult> TestDatabase()
    {
        var dbContext = HttpContext.RequestServices
            .GetRequiredService<IApplicationDbContext>();
        
        // Companies tablosundan kayıt sayısı
        var companyCount = await dbContext.Companies.CountAsync();
        
        return Success(new
        {
            connected = true,
            companyCount = companyCount,
            message = "Veritabanı bağlantısı başarılı"
        });
    }
}

