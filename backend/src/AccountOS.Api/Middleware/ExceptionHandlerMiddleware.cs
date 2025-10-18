using System.Net;
using System.Text.Json;
using AccountOS.Application.Common.Exceptions;

namespace AccountOS.Api.Middleware;

/// <summary>
/// Global exception handler middleware
/// Tüm exception'ları yakalar ve uygun HTTP response döndürür
/// </summary>
public class ExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlerMiddleware> _logger;

    public ExceptionHandlerMiddleware(
        RequestDelegate next, 
        ILogger<ExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Beklenmeyen hata oluştu: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = context.Response;
        response.ContentType = "application/json";

        var errorResponse = new ErrorResponse();

        switch (exception)
        {
            case ValidationException validationEx:
                // FluentValidation hataları
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Message = "Validation hatası";
                errorResponse.Errors = validationEx.Errors;
                break;

            case NotFoundException notFoundEx:
                // Kayıt bulunamadı
                response.StatusCode = (int)HttpStatusCode.NotFound;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Message = notFoundEx.Message;
                break;

            case BusinessException businessEx:
                // İş kuralı ihlali
                response.StatusCode = (int)HttpStatusCode.BadRequest;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Message = businessEx.Message;
                break;

            case UnauthorizedAccessException:
                // Yetki hatası
                response.StatusCode = (int)HttpStatusCode.Unauthorized;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Message = "Yetkiniz yok";
                break;

            default:
                // Beklenmeyen hatalar
                response.StatusCode = (int)HttpStatusCode.InternalServerError;
                errorResponse.StatusCode = response.StatusCode;
                errorResponse.Message = "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
                // Production'da detay gösterme
                #if DEBUG
                errorResponse.Details = exception.Message;
                #endif
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await response.WriteAsync(jsonResponse);
    }

    /// <summary>
    /// API hata response modeli
    /// </summary>
    private class ErrorResponse
    {
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public IDictionary<string, string[]>? Errors { get; set; }
        public string? Details { get; set; }
    }
}

