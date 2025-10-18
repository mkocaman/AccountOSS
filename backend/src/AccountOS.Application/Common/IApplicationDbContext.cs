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
    
    /// <summary>
    /// Değişiklikleri veritabanına kaydet
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Veritabanı değişikliklerini geri al
    /// </summary>
    void RevertChanges();
}

