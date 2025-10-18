using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Email SMTP yapılandırması (per company)
/// </summary>
public class EmailConfiguration : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>SMTP sunucu adresi</summary>
    public string SmtpHost { get; set; } = string.Empty;
    
    /// <summary>SMTP port</summary>
    public int SmtpPort { get; set; }
    
    /// <summary>SSL kullan</summary>
    public bool UseSsl { get; set; } = true;
    
    /// <summary>Kullanıcı adı (email)</summary>
    public string Username { get; set; } = string.Empty;
    
    /// <summary>Şifre (encrypted)</summary>
    public string Password { get; set; } = string.Empty;
    
    /// <summary>Gönderici adı</summary>
    public string SenderName { get; set; } = string.Empty;
    
    /// <summary>Gönderici email</summary>
    public string SenderEmail { get; set; } = string.Empty;
    
    /// <summary>Varsayılan CC</summary>
    public string? DefaultCc { get; set; }
    
    /// <summary>Varsayılan BCC</summary>
    public string? DefaultBcc { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Test edildi mi?</summary>
    public bool IsTested { get; set; } = false;
    
    /// <summary>Son test tarihi</summary>
    public DateTime? LastTestedAt { get; set; }
    
    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    
    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}

