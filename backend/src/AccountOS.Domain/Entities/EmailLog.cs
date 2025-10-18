using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Email gönderim kaydı
/// </summary>
public class EmailLog : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Alıcı email</summary>
    public string ToEmail { get; set; } = string.Empty;
    
    /// <summary>Alıcı adı</summary>
    public string? ToName { get; set; }
    
    /// <summary>CC (virgülle ayrılmış)</summary>
    public string? CcEmails { get; set; }
    
    /// <summary>BCC (virgülle ayrılmış)</summary>
    public string? BccEmails { get; set; }
    
    /// <summary>Konu</summary>
    public string Subject { get; set; } = string.Empty;
    
    /// <summary>HTML body</summary>
    public string HtmlBody { get; set; } = string.Empty;
    
    /// <summary>Plain text body</summary>
    public string? PlainTextBody { get; set; }
    
    /// <summary>Email tipi</summary>
    public EmailTemplateType? TemplateType { get; set; }
    
    /// <summary>Kullanılan şablon ID</summary>
    public Guid? TemplateId { get; set; }
    
    /// <summary>İlgili entity ID (Invoice, Customer, vb.)</summary>
    public Guid? RelatedEntityId { get; set; }
    
    /// <summary>İlgili entity tipi</summary>
    public string? RelatedEntityType { get; set; }
    
    /// <summary>Attachment isimleri (JSON array)</summary>
    public string? AttachmentNames { get; set; }
    
    /// <summary>Gönderim durumu</summary>
    public EmailStatus Status { get; set; }
    
    /// <summary>Gönderim denemeleri</summary>
    public int AttemptCount { get; set; } = 0;
    
    /// <summary>Gönderilme tarihi</summary>
    public DateTime? SentAt { get; set; }
    
    /// <summary>Hata mesajı</summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>Son deneme tarihi</summary>
    public DateTime? LastAttemptAt { get; set; }
    
    /// <summary>Bir sonraki deneme tarihi</summary>
    public DateTime? NextRetryAt { get; set; }
    
    // Navigation Properties
    public virtual EmailTemplate? Template { get; set; }
    
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

