using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountOS.Infrastructure.Persistence;

/// <summary>
/// Veritabanı seed data
/// Geliştirme ve test için örnek veriler
/// </summary>
public static class ApplicationDbContextSeed
{
    /// <summary>
    /// Seed data'yı veritabanına ekler
    /// </summary>
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Currency seed data
            await SeedCurrenciesAsync(context, logger);
            
            // Company seed data
            if (!await context.Companies.AnyAsync())
            {
                var testCompany = new Company
                {
                    Id = Guid.NewGuid(),
                    Name = "Test Şirketi A.Ş.",
                    TaxNumber = "1234567890",
                    TaxOffice = "Ankara",
                    Email = "info@testcompany.com",
                    Phone = "+90 555 123 4567",
                    Address = "Test Mahallesi Test Sokak No:1",
                    City = "Ankara",
                    Country = "TR",
                    BaseCurrency = "TRY",
                    TimeZone = "Europe/Istanbul",
                    DefaultLanguage = "TR",
                    IsActive = true,
                    SubscriptionExpiresAt = DateTime.UtcNow.AddYears(1),
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = Guid.Empty
                };
                
                context.Companies.Add(testCompany);
                await context.SaveChangesAsync();
                
                logger.LogInformation("Seed data eklendi: {CompanyName}", testCompany.Name);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Seed data eklenirken hata oluştu");
            throw;
        }
    }
    
    /// <summary>
    /// Yaygın para birimlerini seed et
    /// </summary>
    private static async Task SeedCurrenciesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Currencies.AnyAsync())
            return;

        var currencies = new List<Currency>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Code = "TRY",
                Name = "Turkish Lira",
                Symbol = "₺",
                DecimalPlaces = 2,
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "USD",
                Name = "US Dollar",
                Symbol = "$",
                DecimalPlaces = 2,
                DisplayOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "EUR",
                Name = "Euro",
                Symbol = "€",
                DecimalPlaces = 2,
                DisplayOrder = 3,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "GBP",
                Name = "British Pound",
                Symbol = "£",
                DecimalPlaces = 2,
                DisplayOrder = 4,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "RUB",
                Name = "Russian Ruble",
                Symbol = "₽",
                DecimalPlaces = 2,
                DisplayOrder = 5,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "UZS",
                Name = "Uzbekistan Som",
                Symbol = "сўм",
                DecimalPlaces = 2,
                DisplayOrder = 6,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "AED",
                Name = "UAE Dirham",
                Symbol = "د.إ",
                DecimalPlaces = 2,
                DisplayOrder = 7,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "SAR",
                Name = "Saudi Riyal",
                Symbol = "﷼",
                DecimalPlaces = 2,
                DisplayOrder = 8,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            }
        };

        await context.Currencies.AddRangeAsync(currencies);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Para birimi seed data eklendi: {Count} adet", currencies.Count);
    }
}
