using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// İki faktörlü doğrulama ayarları
/// </summary>
public class TwoFactorAuth : BaseEntity
{
    /// <summary>Kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>2FA aktif mi?</summary>
    public bool IsEnabled { get; set; }
    
    /// <summary>Secret key (encrypted)</summary>
    public string? SecretKey { get; set; }
    
    /// <summary>Backup codes (encrypted, JSON array)</summary>
    public string? BackupCodes { get; set; }
    
    /// <summary>Son doğrulama zamanı</summary>
    public DateTime? LastVerifiedAt { get; set; }
    
    /// <summary>Güvenilir cihazlar (JSON array - device fingerprints)</summary>
    public string? TrustedDevices { get; set; }
    
    /// <summary>Başarısız deneme sayısı</summary>
    public int FailedAttempts { get; set; }
    
    /// <summary>Kilitlenme zamanı</summary>
    public DateTime? LockedUntil { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
}

