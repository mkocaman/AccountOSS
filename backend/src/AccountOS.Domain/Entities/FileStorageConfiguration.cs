using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Dosya depolama yapılandırması (şirket bazlı)
/// </summary>
public class FileStorageConfiguration : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Depolama tipi</summary>
    public StorageProvider Provider { get; set; }
    
    /// <summary>Yapılandırma ayarları (JSON - provider'a göre farklı)</summary>
    public string Configuration { get; set; } = string.Empty;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Varsayılan provider mı?</summary>
    public bool IsDefault { get; set; }
    
    /// <summary>Depolama kotası (MB)</summary>
    public long StorageQuotaMb { get; set; } = 10240; // 10 GB default
    
    /// <summary>Kullanılan alan (MB)</summary>
    public long UsedStorageMb { get; set; }
    
    /// <summary>Maksimum dosya boyutu (MB)</summary>
    public int MaxFileSizeMb { get; set; } = 50;
    
    /// <summary>İzin verilen dosya tipleri (JSON array)</summary>
    public string? AllowedFileTypes { get; set; }
    
    /// <summary>Test edildi mi?</summary>
    public bool IsTested { get; set; }
    
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

