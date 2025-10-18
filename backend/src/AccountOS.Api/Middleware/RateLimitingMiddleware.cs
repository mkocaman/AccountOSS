using AccountOS.Application.Common.Interfaces;
using System.Security.Claims;

namespace AccountOS.Api.Middleware;

/// <summary>
/// Rate limiting middleware
/// </summary>
public class RateLimitingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RateLimitingMiddleware> _logger;

    public RateLimitingMiddleware(
        RequestDelegate next,
        ILogger<RateLimitingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, IRateLimitService rateLimitService)
    {
        // Exempt endpoints (health, swagger)
        var path = context.Request.Path.Value?.ToLower() ?? "";
        if (path.Contains("/health") || path.Contains("/swagger"))
        {
            await _next(context);
            return;
        }

        // Extract information
        var endpoint = context.Request.Path.Value ?? "";
        var httpMethod = context.Request.Method;
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var ipAddress = GetClientIpAddress(context);
        var apiKey = context.Request.Headers["X-API-Key"].FirstOrDefault();

        // Check rate limit
        var (isAllowed, remaining, retryAfter) = await rateLimitService.CheckRateLimitAsync(
            endpoint,
            httpMethod,
            userId,
            ipAddress,
            apiKey);

        // Add rate limit headers
        context.Response.Headers.Append("X-RateLimit-Remaining", remaining.ToString());

        if (!isAllowed)
        {
            // Rate limit exceeded
            context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            context.Response.Headers.Append("Retry-After", ((int)retryAfter.TotalSeconds).ToString());

            await context.Response.WriteAsJsonAsync(new
            {
                error = "Too many requests. Please try again later.",
                retryAfter = (int)retryAfter.TotalSeconds
            });

            _logger.LogWarning("Rate limit exceeded for {Endpoint} from {IpAddress}", endpoint, ipAddress);
            return;
        }

        await _next(context);
    }

    private string GetClientIpAddress(HttpContext context)
    {
        // X-Forwarded-For header (reverse proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        // X-Real-IP header
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(realIp))
        {
            return realIp;
        }

        // Direct connection
        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}

