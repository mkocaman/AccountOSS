using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Rate limit kuralı
/// </summary>
public class RateLimitRule : TenantEntity
{
    /// <summary>Kural adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Endpoint pattern (örn: /api/v1/invoices/*)</summary>
    public string EndpointPattern { get; set; } = string.Empty;
    
    /// <summary>HTTP method (GET, POST, etc. - null = tümü)</summary>
    public string? HttpMethod { get; set; }
    
    /// <summary>Limit tipi</summary>
    public RateLimitType LimitType { get; set; }
    
    /// <summary>İzin verilen istek sayısı</summary>
    public int RequestLimit { get; set; }
    
    /// <summary>Zaman penceresi (saniye)</summary>
    public int TimeWindowSeconds { get; set; }
    
    /// <summary>Öncelik (yüksek öncelik önce kontrol edilir)</summary>
    public int Priority { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Whitelist IP'ler (JSON array)</summary>
    public string? WhitelistedIps { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
}

