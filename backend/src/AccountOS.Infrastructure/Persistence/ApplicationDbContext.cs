using System.Linq.Expressions;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Common;
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

    // DbSet'ler buraya eklenecek
    // public DbSet<Company> Companies => Set<Company>();
    // public DbSet<User> Users => Set<User>();
    
    /// <summary>
    /// Model yapılandırması (entity configuration, indexes, relationships)
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
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

