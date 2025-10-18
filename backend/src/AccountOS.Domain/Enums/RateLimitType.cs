namespace AccountOS.Domain.Enums;

/// <summary>
/// Rate limit tipi
/// </summary>
public enum RateLimitType
{
    /// <summary>Kullanıcı bazlı</summary>
    PerUser = 0,
    
    /// <summary>IP bazlı</summary>
    PerIp = 1,
    
    /// <summary>Global (tüm istekler)</summary>
    Global = 2,
    
    /// <summary>API key bazlı</summary>
    PerApiKey = 3
}

