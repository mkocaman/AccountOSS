using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Kullanıcı bildirim tercihleri
/// </summary>
public class NotificationPreference : TenantEntity
{
    /// <summary>Kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>Bildirim tipi</summary>
    public NotificationType NotificationType { get; set; }
    
    /// <summary>In-app bildirim aktif mi?</summary>
    public bool InAppEnabled { get; set; } = true;
    
    /// <summary>Email bildirim aktif mi?</summary>
    public bool EmailEnabled { get; set; } = true;
    
    /// <summary>SMS bildirim aktif mi? (future)</summary>
    public bool SmsEnabled { get; set; }
    
    /// <summary>Push notification aktif mi? (future)</summary>
    public bool PushEnabled { get; set; }
    
    /// <summary>Minimum öncelik seviyesi (bu seviyenin altındakiler gönderilmez)</summary>
    public NotificationPriority MinimumPriority { get; set; } = NotificationPriority.Low;
    
    /// <summary>Sessiz saatler başlangıcı (HH:mm format)</summary>
    public string? QuietHoursStart { get; set; }
    
    /// <summary>Sessiz saatler bitişi (HH:mm format)</summary>
    public string? QuietHoursEnd { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
}

