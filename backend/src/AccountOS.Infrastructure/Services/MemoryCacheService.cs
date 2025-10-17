using Microsoft.Extensions.Caching.Memory;
using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Memory cache servisi implementasyonu
/// In-memory cache kullanır
/// Production'da Redis ile değiştirilebilir
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _cache;

    public MemoryCacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        _cache.TryGetValue(key, out T? value);
        return Task.FromResult(value);
    }

    public Task SetAsync<T>(
        string key, 
        T value, 
        TimeSpan? expiration = null, 
        CancellationToken cancellationToken = default)
    {
        var options = new MemoryCacheEntryOptions();
        
        if (expiration.HasValue)
        {
            options.AbsoluteExpirationRelativeToNow = expiration.Value;
        }
        else
        {
            // Varsayılan 1 saat
            options.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
        }
        
        _cache.Set(key, value, options);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        _cache.Remove(key);
        return Task.CompletedTask;
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        // Memory cache pattern ile silme desteklemiyor
        // Redis kullanıldığında implement edilecek
        throw new NotImplementedException("Pattern ile silme Memory Cache'de desteklenmiyor. Redis kullanın.");
    }

    public Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        var exists = _cache.TryGetValue(key, out _);
        return Task.FromResult(exists);
    }
}

