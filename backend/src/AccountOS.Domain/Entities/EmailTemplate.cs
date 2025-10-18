using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Email şablonu
/// </summary>
public class EmailTemplate : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Şablon tipi</summary>
    public EmailTemplateType Type { get; set; }
    
    /// <summary>Şablon adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Konu satırı (değişken destekli)</summary>
    public string Subject { get; set; } = string.Empty;
    
    /// <summary>HTML içerik (değişken destekli)</summary>
    public string HtmlBody { get; set; } = string.Empty;
    
    /// <summary>Plain text içerik</summary>
    public string? PlainTextBody { get; set; }
    
    /// <summary>Varsayılan şablon mu?</summary>
    public bool IsDefault { get; set; } = false;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
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

