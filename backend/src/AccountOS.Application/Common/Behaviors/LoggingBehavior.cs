using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace AccountOS.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior - Logging
/// Tüm Command ve Query'lerin çalışma süresini loglar
/// Performance monitoring için kullanılır
/// </summary>
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        
        _logger.LogInformation("İşlem başladı: {RequestName}", requestName);
        
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var response = await next();
            
            stopwatch.Stop();
            
            _logger.LogInformation(
                "İşlem tamamlandı: {RequestName} - Süre: {ElapsedMilliseconds}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);
            
            // Uzun süren işlemleri logla
            if (stopwatch.ElapsedMilliseconds > 500)
            {
                _logger.LogWarning(
                    "Yavaş işlem tespit edildi: {RequestName} - Süre: {ElapsedMilliseconds}ms",
                    requestName,
                    stopwatch.ElapsedMilliseconds);
            }
            
            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            
            _logger.LogError(
                ex,
                "İşlem hata aldı: {RequestName} - Süre: {ElapsedMilliseconds}ms",
                requestName,
                stopwatch.ElapsedMilliseconds);
            
            throw;
        }
    }
}

