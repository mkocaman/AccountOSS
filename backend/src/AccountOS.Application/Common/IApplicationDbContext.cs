using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Common;

/// <summary>
/// Application katmanının Infrastructure'a bağımlı olmaması için DbContext interface
/// Dependency Inversion Principle (Clean Architecture)
/// </summary>
public interface IApplicationDbContext
{
    // DbSet'ler entity'ler oluşturuldukça eklenecek
    // Örnek: DbSet<Company> Companies { get; }
    
    /// <summary>
    /// Değişiklikleri veritabanına kaydet
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Veritabanı değişikliklerini geri al
    /// </summary>
    void RevertChanges();
}

