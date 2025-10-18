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
            
            // Language & Translation seed data
            await SeedLanguagesAsync(context, logger);
            
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
    
    /// <summary>
    /// Dilleri ve temel çevirileri seed et
    /// </summary>
    private static async Task SeedLanguagesAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Languages.AnyAsync())
            return;

        var languages = new List<Language>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Code = "TR",
                Name = "Turkish",
                NativeName = "Türkçe",
                FlagIcon = "🇹🇷",
                IsRtl = false,
                IsActive = true,
                IsDefault = true,
                DisplayOrder = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "EN",
                Name = "English",
                NativeName = "English",
                FlagIcon = "🇬🇧",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 2,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "RU",
                Name = "Russian",
                NativeName = "Русский",
                FlagIcon = "🇷🇺",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 3,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "UZ",
                Name = "Uzbek",
                NativeName = "O'zbek",
                FlagIcon = "🇺🇿",
                IsRtl = false,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 4,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            },
            new()
            {
                Id = Guid.NewGuid(),
                Code = "AR",
                Name = "Arabic",
                NativeName = "العربية",
                FlagIcon = "🇸🇦",
                IsRtl = true,
                IsActive = true,
                IsDefault = false,
                DisplayOrder = 5,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = Guid.Empty
            }
        };

        await context.Languages.AddRangeAsync(languages);
        await context.SaveChangesAsync();

        // Temel çeviriler (örnek)
        var trLanguage = languages.First(l => l.Code == "TR");
        var enLanguage = languages.First(l => l.Code == "EN");
        var ruLanguage = languages.First(l => l.Code == "RU");

        var translations = new List<Translation>
        {
            // Turkish
            new() { Id = Guid.NewGuid(), LanguageId = trLanguage.Id, Key = "common.save", Value = "Kaydet", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = trLanguage.Id, Key = "common.cancel", Value = "İptal", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = trLanguage.Id, Key = "common.delete", Value = "Sil", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = trLanguage.Id, Key = "invoice.create.title", Value = "Fatura Oluştur", Category = "invoice", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = trLanguage.Id, Key = "customer.list.title", Value = "Cari Hesaplar", Category = "customer", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            
            // English
            new() { Id = Guid.NewGuid(), LanguageId = enLanguage.Id, Key = "common.save", Value = "Save", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = enLanguage.Id, Key = "common.cancel", Value = "Cancel", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = enLanguage.Id, Key = "common.delete", Value = "Delete", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = enLanguage.Id, Key = "invoice.create.title", Value = "Create Invoice", Category = "invoice", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = enLanguage.Id, Key = "customer.list.title", Value = "Customers", Category = "customer", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            
            // Russian
            new() { Id = Guid.NewGuid(), LanguageId = ruLanguage.Id, Key = "common.save", Value = "Сохранить", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = ruLanguage.Id, Key = "common.cancel", Value = "Отмена", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = ruLanguage.Id, Key = "common.delete", Value = "Удалить", Category = "common", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = ruLanguage.Id, Key = "invoice.create.title", Value = "Создать счет", Category = "invoice", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
            new() { Id = Guid.NewGuid(), LanguageId = ruLanguage.Id, Key = "customer.list.title", Value = "Клиенты", Category = "customer", CreatedAt = DateTime.UtcNow, CreatedBy = Guid.Empty },
        };

        await context.Translations.AddRangeAsync(translations);
        await context.SaveChangesAsync();
        
        logger.LogInformation("Dil ve çeviri seed data eklendi: {LanguageCount} dil, {TranslationCount} çeviri", languages.Count, translations.Count);
    }
}
