using AccountOS.Domain.Entities;
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
            // Company seed data
            if (!context.Companies.Any())
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
                    Currency = "TRY",
                    TimeZone = "Europe/Istanbul",
                    Language = "tr",
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
}
