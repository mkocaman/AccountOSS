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
        
        // Encryption Service (for sensitive data)
        services.AddSingleton<EncryptionService>();
        
        // Email Service
        services.AddScoped<IEmailService, EmailService>();
        
        // Audit Service
        services.AddScoped<IAuditService, AuditService>();
        
        // Cache Service
        services.AddMemoryCache();
        services.AddScoped<ICacheService, MemoryCacheService>();
        
        // File Storage Service (legacy - simple)
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        
        // File Storage Providers (multi-provider)
        services.AddScoped<Services.FileStorage.LocalDiskStorageProvider>();
        services.AddScoped<Services.FileStorage.CustomCdnStorageProvider>();
        services.AddScoped<Services.FileStorage.FileStorageService>();
        services.AddHttpClient(); // For CustomCdnStorageProvider
        
        // Stock Service (FIFO)
        services.AddScoped<IStockService, StockService>();
        
        // Document Numbering Service
        services.AddScoped<IDocumentNumberingService, DocumentNumberingService>();
        
        // PDF Service
        services.AddScoped<IPdfService, PdfService>();
        
        // Notification Service
        services.AddScoped<INotificationService, NotificationService>();
        
        // Security Services
        services.AddScoped<IRateLimitService, RateLimitService>();
        services.AddScoped<ITwoFactorAuthService, TwoFactorAuthService>();
        
        // Tax & Accounting Services
        services.AddScoped<ITaxService, TaxService>();
        services.AddScoped<IJournalEntryService, JournalEntryService>();
        
        // Search Service
        services.AddScoped<ISearchService, SearchService>();
        
        // NOT: HttpContextAccessor API katmanında (Program.cs) eklenir
        // services.AddHttpContextAccessor(); 
        
        return services;
    }
}

