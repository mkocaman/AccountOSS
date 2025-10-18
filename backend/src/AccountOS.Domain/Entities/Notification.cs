using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Bildirim entity
/// </summary>
public class Notification : TenantEntity
{
    /// <summary>Alıcı kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>Bildirim tipi</summary>
    public NotificationType Type { get; set; }
    
    /// <summary>Öncelik seviyesi</summary>
    public NotificationPriority Priority { get; set; }
    
    /// <summary>Başlık</summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>Mesaj içeriği</summary>
    public string Message { get; set; } = string.Empty;
    
    /// <summary>Bağlı olduğu entity tipi (opsiyonel)</summary>
    public string? EntityType { get; set; }
    
    /// <summary>Bağlı olduğu entity ID (opsiyonel)</summary>
    public Guid? EntityId { get; set; }
    
    /// <summary>Entity adı (görüntüleme için)</summary>
    public string? EntityName { get; set; }
    
    /// <summary>Action URL (tıklandığında gidilecek sayfa)</summary>
    public string? ActionUrl { get; set; }
    
    /// <summary>Icon (UI için)</summary>
    public string? Icon { get; set; }
    
    /// <summary>Renk (UI için)</summary>
    public string? Color { get; set; }
    
    /// <summary>Metadata (JSON - ekstra bilgiler)</summary>
    public string? Metadata { get; set; }
    
    /// <summary>Okundu mu?</summary>
    public bool IsRead { get; set; }
    
    /// <summary>Okunma tarihi</summary>
    public DateTime? ReadAt { get; set; }
    
    /// <summary>Email gönderildi mi?</summary>
    public bool EmailSent { get; set; }
    
    /// <summary>Email gönderim tarihi</summary>
    public DateTime? EmailSentAt { get; set; }
    
    /// <summary>Son görüntüleme tarihi</summary>
    public DateTime? LastViewedAt { get; set; }
    
    /// <summary>Geçerlilik süresi (null = sınırsız)</summary>
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
}

