using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using AccountOS.Application.Common.Behaviors;

namespace AccountOS.Application;

/// <summary>
/// Application katmanı Dependency Injection konfigürasyonu
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Application servislerini ekler
    /// </summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // MediatR - Assembly'deki tüm handler'ları bul ve ekle
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            
            // Pipeline behaviors - sıralama önemli!
            cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        });
        
        // FluentValidation - Assembly'deki tüm validator'ları bul ve ekle
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        
        return services;
    }
}

