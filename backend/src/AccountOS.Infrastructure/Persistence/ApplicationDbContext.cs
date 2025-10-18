using System.Linq.Expressions;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Common;
using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Infrastructure.Persistence;

/// <summary>
/// Entity Framework Core DbContext
/// Tüm veritabanı işlemleri bu sınıf üzerinden yapılır
/// </summary>
public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ITenantService tenantService,
        ICurrentUserService currentUserService) 
        : base(options)
    {
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    // DbSet'ler
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserCompany> UserCompanies => Set<UserCompany>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<FxRate> FxRates => Set<FxRate>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductTranslation> ProductTranslations => Set<ProductTranslation>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Translation> Translations => Set<Translation>();
    public DbSet<StockLayer> StockLayers => Set<StockLayer>();
    public DbSet<StockConsumption> StockConsumptions => Set<StockConsumption>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<DocumentNumberingTemplate> DocumentNumberingTemplates => Set<DocumentNumberingTemplate>();
    public DbSet<EmailConfiguration> EmailConfigurations => Set<EmailConfiguration>();
    public DbSet<EmailTemplate> EmailTemplates => Set<EmailTemplate>();
    public DbSet<EmailLog> EmailLogs => Set<EmailLog>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<FileStorageConfiguration> FileStorageConfigurations => Set<FileStorageConfiguration>();
    public DbSet<StoredFile> StoredFiles => Set<StoredFile>();
    public DbSet<FileAttachment> FileAttachments => Set<FileAttachment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    public DbSet<RateLimitRule> RateLimitRules => Set<RateLimitRule>();
    public DbSet<IpBlacklist> IpBlacklist => Set<IpBlacklist>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<TwoFactorAuth> TwoFactorAuths => Set<TwoFactorAuth>();
    public DbSet<UserPreference> UserPreferences => Set<UserPreference>();
    public DbSet<CompanySettings> CompanySettings => Set<CompanySettings>();
    public DbSet<DashboardWidget> DashboardWidgets => Set<DashboardWidget>();
    public DbSet<TaxRate> TaxRates => Set<TaxRate>();
    public DbSet<TaxCalculation> TaxCalculations => Set<TaxCalculation>();
    public DbSet<ChartOfAccount> ChartOfAccounts => Set<ChartOfAccount>();
    public DbSet<JournalEntry> JournalEntries => Set<JournalEntry>();
    public DbSet<JournalEntryLine> JournalEntryLines => Set<JournalEntryLine>();
    public DbSet<AccountingPeriod> AccountingPeriods => Set<AccountingPeriod>();
    
    /// <summary>
    /// Model yapılandırması (entity configuration, indexes, relationships)
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.Property(e => e.UserName)
                .HasMaxLength(100);
            
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);
            
            entity.Property(e => e.Phone)
                .HasMaxLength(50);
            
            entity.Property(e => e.AvatarPath)
                .HasMaxLength(500);
            
            entity.Property(e => e.EmailConfirmationToken)
                .HasMaxLength(500);
            
            entity.Property(e => e.PasswordResetToken)
                .HasMaxLength(500);
            
            // Indexes
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.UserName).IsUnique();
            entity.HasIndex(e => e.IsActive);
        });

        // UserCompany configuration
        modelBuilder.Entity<UserCompany>(entity =>
        {
            entity.ToTable("user_companies");
            
            entity.HasKey(e => new { e.UserId, e.CompanyId });
            
            entity.Property(e => e.Role)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserCompanies)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasOne(e => e.Company)
                .WithMany()
                .HasForeignKey(e => e.CompanyId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => new { e.UserId, e.IsDefault });
        });

        // UserRole configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("user_roles");
            
            entity.Property(e => e.RoleName)
                .IsRequired()
                .HasMaxLength(50);
            
            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            
            entity.HasIndex(e => new { e.UserId, e.RoleName });
        });
        
        base.OnModelCreating(modelBuilder);
        
        // Company configuration
        modelBuilder.Entity<Company>(entity =>
        {
            entity.ToTable("companies");
            
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
                
            entity.Property(e => e.TaxNumber)
                .HasMaxLength(50);
                
            entity.Property(e => e.TaxOffice)
                .HasMaxLength(200);
                
            entity.Property(e => e.Email)
                .HasMaxLength(200);
                
            entity.Property(e => e.Phone)
                .HasMaxLength(50);
                
            entity.Property(e => e.Address)
                .HasMaxLength(500);
                
            entity.Property(e => e.City)
                .HasMaxLength(100);
                
            entity.Property(e => e.Country)
                .IsRequired()
                .HasMaxLength(2);
                
            entity.Property(e => e.BaseCurrency)
                .IsRequired()
                .HasMaxLength(3);
                
            entity.Property(e => e.TimeZone)
                .IsRequired()
                .HasMaxLength(100);
                
            entity.Property(e => e.DefaultLanguage)
                .IsRequired()
                .HasMaxLength(2);
                
            entity.Property(e => e.LogoUrl)
                .HasMaxLength(500);
                
            entity.Property(e => e.PrimaryColor)
                .HasMaxLength(20);
                
            // Indexes
            entity.HasIndex(e => e.TaxNumber);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.IsActive);
        });
        
        // Assembly'deki tüm IEntityTypeConfiguration implementasyonlarını uygula
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        
        // Global Query Filter: Multi-Tenant Isolation
        ConfigureGlobalQueryFilters(modelBuilder);
        
        // Global Query Filter: Soft Delete
        ConfigureSoftDeleteFilter(modelBuilder);
    }
    
    /// <summary>
    /// Multi-tenant global query filter
    /// TenantEntity'den türeyen tüm entity'lere otomatik CompanyId filtresi uygular
    /// </summary>
    private void ConfigureGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        // TenantEntity'den türeyen tüm entity'leri bul
        var tenantEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(e => typeof(ITenantEntity).IsAssignableFrom(e.ClrType));
        
        foreach (var entityType in tenantEntityTypes)
        {
            // Dinamik olarak filter expression oluştur
            // entity => entity.CompanyId == _tenantService.GetCurrentCompanyId()
            var parameter = Expression.Parameter(entityType.ClrType, "entity");
            var property = Expression.Property(parameter, nameof(ITenantEntity.CompanyId));
            var companyId = Expression.Constant(_tenantService.GetCurrentCompanyId());
            var equalExpression = Expression.Equal(property, companyId);
            var lambda = Expression.Lambda(equalExpression, parameter);
            
            entityType.SetQueryFilter(lambda);
        }
    }
    
    /// <summary>
    /// Soft delete global query filter
    /// ISoftDeletable'dan türeyen entity'lere IsDeleted = false filtresi uygular
    /// </summary>
    private void ConfigureSoftDeleteFilter(ModelBuilder modelBuilder)
    {
        var softDeleteEntityTypes = modelBuilder.Model
            .GetEntityTypes()
            .Where(e => typeof(ISoftDeletable).IsAssignableFrom(e.ClrType));
        
        foreach (var entityType in softDeleteEntityTypes)
        {
            // entity => !entity.IsDeleted
            var parameter = Expression.Parameter(entityType.ClrType, "entity");
            var property = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
            var notExpression = Expression.Not(property);
            var lambda = Expression.Lambda(notExpression, parameter);
            
            // Mevcut filter'a AND operatörü ile ekle
            var existingFilter = entityType.GetQueryFilter();
            if (existingFilter != null)
            {
                var andExpression = Expression.AndAlso(existingFilter.Body, notExpression);
                lambda = Expression.Lambda(andExpression, parameter);
            }
            
            entityType.SetQueryFilter(lambda);
        }
    }
    
    /// <summary>
    /// SaveChanges override: Audit ve soft delete logic
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Entity'lerdeki değişiklikleri audit ve soft delete için işle
        ProcessAuditableEntities();
        ProcessSoftDeletableEntities();
        
        // Domain event'leri işle (sonra eklenecek)
        // await PublishDomainEventsAsync(cancellationToken);
        
        return await base.SaveChangesAsync(cancellationToken);
    }
    
    /// <summary>
    /// Audit alanlarını otomatik doldur
    /// </summary>
    private void ProcessAuditableEntities()
    {
        var entries = ChangeTracker
            .Entries<IAuditableEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified);
        
        foreach (var entry in entries)
        {
            var now = DateTime.UtcNow;
            var userId = _currentUserService.UserId ?? Guid.Empty;
            
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
                entry.Entity.CreatedBy = userId;
            }
            
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
                entry.Entity.UpdatedBy = userId;
            }
        }
    }
    
    /// <summary>
    /// Soft delete logic: Delete yerine IsDeleted = true
    /// </summary>
    private void ProcessSoftDeletableEntities()
    {
        var entries = ChangeTracker
            .Entries<ISoftDeletable>()
            .Where(e => e.State == EntityState.Deleted);
        
        foreach (var entry in entries)
        {
            // Fiziksel silme yerine soft delete yap
            entry.State = EntityState.Modified;
            entry.Entity.IsDeleted = true;
            entry.Entity.DeletedAt = DateTime.UtcNow;
            entry.Entity.DeletedBy = _currentUserService.UserId ?? Guid.Empty;
        }
    }
    
    /// <summary>
    /// Değişiklikleri geri al (rollback)
    /// </summary>
    public void RevertChanges()
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.State = EntityState.Detached;
                    break;
                case EntityState.Modified:
                case EntityState.Deleted:
                    entry.Reload();
                    break;
            }
        }
    }
}

