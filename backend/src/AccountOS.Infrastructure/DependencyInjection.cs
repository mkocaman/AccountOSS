using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Infrastructure.Persistence;
using AccountOS.Infrastructure.Services;

namespace AccountOS.Infrastructure;

/// <summary>
/// Infrastructure katmanı Dependency Injection konfigürasyonu
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Infrastructure servislerini ekler
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        string connectionString)
    {
        // DbContext
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));
        
        // Interface bindings
        services.AddScoped<IApplicationDbContext>(provider => 
            provider.GetRequiredService<ApplicationDbContext>());
        
        // Core Services
        services.AddScoped<ITenantService, TenantService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IDateTimeService, DateTimeService>();
        
        // Authentication Services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        
        // Email Service
        services.AddScoped<IEmailService, EmailService>();
        
        // Cache Service
        services.AddMemoryCache();
        services.AddScoped<ICacheService, MemoryCacheService>();
        
        // File Storage Service
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        
        // NOT: HttpContextAccessor API katmanında (Program.cs) eklenir
        // services.AddHttpContextAccessor(); 
        
        return services;
    }
}

