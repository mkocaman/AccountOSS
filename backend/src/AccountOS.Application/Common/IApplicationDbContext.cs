using Microsoft.EntityFrameworkCore;
using AccountOS.Domain.Entities;

namespace AccountOS.Application.Common;

/// <summary>
/// Application katmanının Infrastructure'a bağımlı olmaması için DbContext interface
/// Dependency Inversion Principle (Clean Architecture)
/// </summary>
public interface IApplicationDbContext
{
    // DbSet'ler
    DbSet<Company> Companies { get; }
    DbSet<User> Users { get; }
    DbSet<UserCompany> UserCompanies { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<Currency> Currencies { get; }
    DbSet<FxRate> FxRates { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductTranslation> ProductTranslations { get; }
    DbSet<Language> Languages { get; }
    DbSet<Translation> Translations { get; }
    DbSet<StockLayer> StockLayers { get; }
    DbSet<StockConsumption> StockConsumptions { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<Invoice> Invoices { get; }
    DbSet<InvoiceItem> InvoiceItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<DocumentNumberingTemplate> DocumentNumberingTemplates { get; }
    DbSet<EmailConfiguration> EmailConfigurations { get; }
    DbSet<EmailTemplate> EmailTemplates { get; }
    DbSet<EmailLog> EmailLogs { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<ExpenseCategory> ExpenseCategories { get; }
    DbSet<Expense> Expenses { get; }
    DbSet<FileStorageConfiguration> FileStorageConfigurations { get; }
    DbSet<StoredFile> StoredFiles { get; }
    DbSet<FileAttachment> FileAttachments { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<NotificationPreference> NotificationPreferences { get; }
    DbSet<NotificationTemplate> NotificationTemplates { get; }
    DbSet<RateLimitRule> RateLimitRules { get; }
    DbSet<IpBlacklist> IpBlacklist { get; }
    DbSet<ApiKey> ApiKeys { get; }
    DbSet<TwoFactorAuth> TwoFactorAuths { get; }
    
    /// <summary>
    /// Değişiklikleri veritabanına kaydet
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Veritabanı değişikliklerini geri al
    /// </summary>
    void RevertChanges();
}

