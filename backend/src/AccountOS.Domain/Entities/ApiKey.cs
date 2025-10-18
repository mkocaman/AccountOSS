using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// API anahtarı (external integration için)
/// </summary>
public class ApiKey : TenantEntity
{
    /// <summary>API key adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Key (hashed)</summary>
    public string KeyHash { get; set; } = string.Empty;
    
    /// <summary>Key prefix (ilk 8 karakter - görüntüleme için)</summary>
    public string KeyPrefix { get; set; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>İzinler (JSON array - endpoint patterns)</summary>
    public string? Permissions { get; set; }
    
    /// <summary>Rate limit (istek/dakika)</summary>
    public int RateLimitPerMinute { get; set; } = 60;
    
    /// <summary>Son kullanım tarihi</summary>
    public DateTime? LastUsedAt { get; set; }
    
    /// <summary>Kullanım sayısı</summary>
    public long UsageCount { get; set; }
    
    /// <summary>Geçerlilik bitiş tarihi</summary>
    public DateTime? ExpiresAt { get; set; }
    
    /// <summary>IP kısıtlaması (JSON array)</summary>
    public string? AllowedIps { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
}

