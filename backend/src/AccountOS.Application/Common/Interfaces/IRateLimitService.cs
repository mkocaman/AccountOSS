namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Rate limiting servisi
/// </summary>
public interface IRateLimitService
{
    /// <summary>
    /// İsteğin rate limit'e takılıp takılmadığını kontrol et
    /// </summary>
    Task<(bool IsAllowed, int RemainingRequests, TimeSpan RetryAfter)> CheckRateLimitAsync(
        string endpoint,
        string httpMethod,
        string? userId = null,
        string? ipAddress = null,
        string? apiKey = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// IP adresinin blacklist'te olup olmadığını kontrol et
    /// </summary>
    Task<bool> IsIpBlacklistedAsync(string ipAddress, CancellationToken cancellationToken = default);

    /// <summary>
    /// IP adresini blacklist'e ekle
    /// </summary>
    Task BlacklistIpAsync(
        string ipAddress,
        string reason,
        DateTime? blockedUntil = null,
        bool isAutoBlocked = false,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Başarısız giriş denemesini kaydet
    /// </summary>
    Task RecordFailedLoginAttemptAsync(string ipAddress, CancellationToken cancellationToken = default);
}

