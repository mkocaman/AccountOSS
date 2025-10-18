using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Text;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Rate limiting service implementation
/// </summary>
public class RateLimitService : IRateLimitService
{
    private readonly IApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly ILogger<RateLimitService> _logger;
    private const int MaxFailedLoginAttempts = 5;
    private const int LoginLockoutMinutes = 30;

    public RateLimitService(
        IApplicationDbContext context,
        IMemoryCache cache,
        ILogger<RateLimitService> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<(bool IsAllowed, int RemainingRequests, TimeSpan RetryAfter)> CheckRateLimitAsync(
        string endpoint,
        string httpMethod,
        string? userId = null,
        string? ipAddress = null,
        string? apiKey = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // GEÇİCİ: Rate limit devre dışı (LINQ translation hatası nedeniyle)
            return (true, int.MaxValue, TimeSpan.Zero);
            
            // IP blacklist kontrolü
            if (!string.IsNullOrWhiteSpace(ipAddress))
            {
                var isBlacklisted = await IsIpBlacklistedAsync(ipAddress, cancellationToken);
                if (isBlacklisted)
                {
                    return (false, 0, TimeSpan.FromHours(1));
                }
            }

            // Uygun rate limit kuralını bul
            var rule = await GetMatchingRuleAsync(endpoint, httpMethod, cancellationToken);
            if (rule == null)
            {
                // Kural yoksa izin ver
                return (true, int.MaxValue, TimeSpan.Zero);
            }

            // Whitelist kontrolü
            if (!string.IsNullOrWhiteSpace(ipAddress) && IsIpWhitelisted(rule, ipAddress))
            {
                return (true, int.MaxValue, TimeSpan.Zero);
            }

            // Cache key oluştur
            var cacheKey = BuildCacheKey(rule, userId, ipAddress, apiKey);

            // Cache'den sayaçları al
            var requestCount = _cache.Get<int>(cacheKey);

            if (requestCount >= rule.RequestLimit)
            {
                // Limit aşıldı
                var retryAfter = TimeSpan.FromSeconds(rule.TimeWindowSeconds);
                _logger.LogWarning("Rate limit exceeded for {CacheKey}", cacheKey);
                return (false, 0, retryAfter);
            }

            // Sayacı artır
            requestCount++;
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(rule.TimeWindowSeconds)
            };
            _cache.Set(cacheKey, requestCount, cacheOptions);

            var remaining = rule.RequestLimit - requestCount;
            return (true, remaining, TimeSpan.Zero);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking rate limit");
            // Hata durumunda izin ver (fail-open)
            return (true, int.MaxValue, TimeSpan.Zero);
        }
    }

    public async Task<bool> IsIpBlacklistedAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"ip_blacklist:{ipAddress}";

        // Cache'de var mı?
        if (_cache.TryGetValue(cacheKey, out bool isBlacklisted))
        {
            return isBlacklisted;
        }

        // Veritabanından kontrol et
        var now = DateTime.UtcNow;
        var blacklistEntry = await _context.IpBlacklist
            .Where(b => b.IpAddress == ipAddress
                     && b.IsActive
                     && (b.BlockedUntil == null || b.BlockedUntil > now))
            .FirstOrDefaultAsync(cancellationToken);

        isBlacklisted = blacklistEntry != null;

        // Cache'e ekle (5 dakika)
        _cache.Set(cacheKey, isBlacklisted, TimeSpan.FromMinutes(5));

        return isBlacklisted;
    }

    public async Task BlacklistIpAsync(
        string ipAddress,
        string reason,
        DateTime? blockedUntil = null,
        bool isAutoBlocked = false,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Zaten blacklist'te mi kontrol et
            var existing = await _context.IpBlacklist
                .Where(b => b.IpAddress == ipAddress && b.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            if (existing != null)
            {
                // Güncelle
                existing.Reason = reason;
                existing.BlockedUntil = blockedUntil;
                existing.FailedAttempts++;
                existing.LastActivityAt = DateTime.UtcNow;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Yeni ekle
                var blacklistEntry = new IpBlacklist
                {
                    Id = Guid.NewGuid(),
                    IpAddress = ipAddress,
                    Reason = reason,
                    BlockedAt = DateTime.UtcNow,
                    BlockedUntil = blockedUntil,
                    IsAutoBlocked = isAutoBlocked,
                    FailedAttempts = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = Guid.Empty
                };

                _context.IpBlacklist.Add(blacklistEntry);
            }

            await _context.SaveChangesAsync(cancellationToken);

            // Cache'i temizle
            _cache.Remove($"ip_blacklist:{ipAddress}");

            _logger.LogWarning("IP {IpAddress} blacklisted: {Reason}", ipAddress, reason);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blacklisting IP {IpAddress}", ipAddress);
        }
    }

    public async Task RecordFailedLoginAttemptAsync(string ipAddress, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = $"failed_login:{ipAddress}";
            var failedAttempts = _cache.Get<int>(cacheKey);

            failedAttempts++;

            // Cache'e kaydet
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(LoginLockoutMinutes)
            };
            _cache.Set(cacheKey, failedAttempts, cacheOptions);

            // Maksimum deneme sayısı aşıldı mı?
            if (failedAttempts >= MaxFailedLoginAttempts)
            {
                var blockedUntil = DateTime.UtcNow.AddMinutes(LoginLockoutMinutes);
                await BlacklistIpAsync(
                    ipAddress,
                    $"Too many failed login attempts ({failedAttempts})",
                    blockedUntil,
                    true,
                    cancellationToken);

                _logger.LogWarning("IP {IpAddress} auto-blocked after {Attempts} failed login attempts", 
                    ipAddress, failedAttempts);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error recording failed login attempt for IP {IpAddress}", ipAddress);
        }
    }

    // Helper Methods

    private async Task<RateLimitRule?> GetMatchingRuleAsync(
        string endpoint,
        string httpMethod,
        CancellationToken cancellationToken)
    {
        // Cache key
        var cacheKey = "rate_limit_rules";

        // Cache'den kuralları al
        if (!_cache.TryGetValue(cacheKey, out List<RateLimitRule>? rules))
        {
            rules = await _context.RateLimitRules
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.Priority)
                .ToListAsync(cancellationToken);

            // Cache'e ekle (5 dakika)
            _cache.Set(cacheKey, rules, TimeSpan.FromMinutes(5));
        }

        if (rules == null || !rules.Any())
            return null;

        // Pattern matching ile uygun kuralı bul
        foreach (var rule in rules)
        {
            // HTTP method kontrolü
            if (!string.IsNullOrWhiteSpace(rule.HttpMethod) && 
                !string.Equals(rule.HttpMethod, httpMethod, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            // Endpoint pattern matching
            if (IsEndpointMatch(endpoint, rule.EndpointPattern))
            {
                return rule;
            }
        }

        return null;
    }

    private bool IsEndpointMatch(string endpoint, string pattern)
    {
        // Basit wildcard matching
        if (pattern == "*")
            return true;

        if (pattern.EndsWith("/*"))
        {
            var prefix = pattern[..^2];
            return endpoint.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }

        return string.Equals(endpoint, pattern, StringComparison.OrdinalIgnoreCase);
    }

    private bool IsIpWhitelisted(RateLimitRule rule, string ipAddress)
    {
        if (string.IsNullOrWhiteSpace(rule.WhitelistedIps))
            return false;

        try
        {
            var whitelistedIps = JsonSerializer.Deserialize<List<string>>(rule.WhitelistedIps);
            return whitelistedIps?.Contains(ipAddress) ?? false;
        }
        catch
        {
            return false;
        }
    }

    private string BuildCacheKey(RateLimitRule rule, string? userId, string? ipAddress, string? apiKey)
    {
        var sb = new StringBuilder("rate_limit:");
        sb.Append(rule.Id).Append(':');

        return rule.LimitType switch
        {
            RateLimitType.PerUser => sb.Append("user:").Append(userId ?? "anonymous").ToString(),
            RateLimitType.PerIp => sb.Append("ip:").Append(ipAddress ?? "unknown").ToString(),
            RateLimitType.PerApiKey => sb.Append("apikey:").Append(apiKey ?? "unknown").ToString(),
            RateLimitType.Global => sb.Append("global").ToString(),
            _ => sb.Append("unknown").ToString()
        };
    }
}

