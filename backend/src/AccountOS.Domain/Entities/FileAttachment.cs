using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Dosya eklentisi (polymorphic relationship)
/// </summary>
public class FileAttachment : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Dosya ID</summary>
    public Guid FileId { get; set; }
    
    /// <summary>Bağlı olduğu entity tipi</summary>
    public string EntityType { get; set; } = string.Empty;
    
    /// <summary>Bağlı olduğu entity ID</summary>
    public Guid EntityId { get; set; }
    
    /// <summary>Ek açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Sıralama</summary>
    public int DisplayOrder { get; set; }
    
    /// <summary>Zorunlu mu?</summary>
    public bool IsRequired { get; set; }
    
    // Navigation Properties
    public virtual StoredFile File { get; set; } = null!;
    
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

