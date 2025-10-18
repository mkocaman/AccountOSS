using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Dosya entity (metadata)
/// </summary>
public class StoredFile : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Dosya adı (orijinal)</summary>
    public string FileName { get; set; } = string.Empty;
    
    /// <summary>Dosya yolu/key (storage'da)</summary>
    public string FilePath { get; set; } = string.Empty;
    
    /// <summary>Dosya boyutu (bytes)</summary>
    public long FileSizeBytes { get; set; }
    
    /// <summary>MIME type</summary>
    public string ContentType { get; set; } = string.Empty;
    
    /// <summary>Dosya uzantısı</summary>
    public string FileExtension { get; set; } = string.Empty;
    
    /// <summary>Storage provider</summary>
    public Enums.StorageProvider StorageProvider { get; set; }
    
    /// <summary>Genel erişime açık mı?</summary>
    public bool IsPublic { get; set; }
    
    /// <summary>Public URL (varsa)</summary>
    public string? PublicUrl { get; set; }
    
    /// <summary>Thumbnail path (resimler için)</summary>
    public string? ThumbnailPath { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Etiketler (JSON array)</summary>
    public string? Tags { get; set; }
    
    /// <summary>MD5 hash (duplicate check için)</summary>
    public string? FileHash { get; set; }
    
    /// <summary>İndirme sayısı</summary>
    public int DownloadCount { get; set; }
    
    /// <summary>Son indirme tarihi</summary>
    public DateTime? LastDownloadedAt { get; set; }
    
    /// <summary>Virüs tarandı mı?</summary>
    public bool IsScanned { get; set; }
    
    /// <summary>Virüs bulundu mu?</summary>
    public bool HasVirus { get; set; }
    
    /// <summary>Version bilgisi</summary>
    public int Version { get; set; } = 1;
    
    /// <summary>Parent file (versioning için)</summary>
    public Guid? ParentFileId { get; set; }
    
    // Navigation Properties
    public virtual StoredFile? ParentFile { get; set; }
    public virtual ICollection<StoredFile> Versions { get; set; } = new List<StoredFile>();
    public virtual ICollection<FileAttachment> Attachments { get; set; } = new List<FileAttachment>();
    
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

