using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// IP kara listesi
/// </summary>
public class IpBlacklist : BaseEntity
{
    /// <summary>IP adresi</summary>
    public string IpAddress { get; set; } = string.Empty;
    
    /// <summary>Bloke edilme nedeni</summary>
    public string Reason { get; set; } = string.Empty;
    
    /// <summary>Bloke başlangıç tarihi</summary>
    public DateTime BlockedAt { get; set; }
    
    /// <summary>Bloke bitiş tarihi (null = kalıcı)</summary>
    public DateTime? BlockedUntil { get; set; }
    
    /// <summary>Otomatik mi bloke edildi?</summary>
    public bool IsAutoBlocked { get; set; }
    
    /// <summary>Başarısız deneme sayısı</summary>
    public int FailedAttempts { get; set; }
    
    /// <summary>Son aktivite tarihi</summary>
    public DateTime? LastActivityAt { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
}

