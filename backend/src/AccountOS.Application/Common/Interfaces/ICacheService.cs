namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Cache servisi
/// Redis veya Memory Cache kullanılabilir
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Cache'den değer okur
    /// </summary>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Cache'e değer yazar
    /// </summary>
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Cache'den siler
    /// </summary>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Pattern ile eşleşen tüm anahtarları siler
    /// Örnek: "company:*" tüm company cache'lerini siler
    /// </summary>
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Cache'de key var mı?
    /// </summary>
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
}

