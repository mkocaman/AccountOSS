namespace AccountOS.Domain.Enums;

/// <summary>
/// Bildirim öncelik seviyesi
/// </summary>
public enum NotificationPriority
{
    /// <summary>Düşük öncelik</summary>
    Low = 0,
    
    /// <summary>Normal öncelik</summary>
    Medium = 1,
    
    /// <summary>Yüksek öncelik</summary>
    High = 2,
    
    /// <summary>Kritik öncelik</summary>
    Critical = 3
}

