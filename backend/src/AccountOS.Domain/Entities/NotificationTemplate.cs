using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Bildirim şablonu
/// </summary>
public class NotificationTemplate : TenantEntity
{
    /// <summary>Şablon kodu (unique)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Bildirim tipi</summary>
    public NotificationType Type { get; set; }
    
    /// <summary>Başlık şablonu</summary>
    public string TitleTemplate { get; set; } = string.Empty;
    
    /// <summary>Mesaj şablonu</summary>
    public string MessageTemplate { get; set; } = string.Empty;
    
    /// <summary>Varsayılan öncelik</summary>
    public NotificationPriority DefaultPriority { get; set; }
    
    /// <summary>Action URL şablonu</summary>
    public string? ActionUrlTemplate { get; set; }
    
    /// <summary>Icon</summary>
    public string? Icon { get; set; }
    
    /// <summary>Renk</summary>
    public string? Color { get; set; }
    
    /// <summary>Email gönderilsin mi?</summary>
    public bool SendEmail { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
}

