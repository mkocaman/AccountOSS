namespace AccountOS.Api.Middleware;

/// <summary>
/// Security headers middleware - OWASP recommended headers
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // X-Content-Type-Options
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");

        // X-Frame-Options
        context.Response.Headers.Append("X-Frame-Options", "DENY");

        // X-XSS-Protection
        context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");

        // Referrer-Policy
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");

        // Content-Security-Policy
        context.Response.Headers.Append("Content-Security-Policy", 
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;");

        // Permissions-Policy
        context.Response.Headers.Append("Permissions-Policy", 
            "geolocation=(), microphone=(), camera=()");

        // Strict-Transport-Security (only for HTTPS)
        if (context.Request.IsHttps)
        {
            context.Response.Headers.Append("Strict-Transport-Security", 
                "max-age=31536000; includeSubDomains");
        }

        await _next(context);
    }
}

