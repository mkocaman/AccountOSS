using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Dashboard widget ayarları
/// </summary>
public class DashboardWidget : BaseEntity
{
    /// <summary>Kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>Widget tipi (revenue-chart, invoice-list, etc.)</summary>
    public string WidgetType { get; set; } = string.Empty;
    
    /// <summary>Widget başlığı</summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>Widget ayarları (JSON)</summary>
    public string? Settings { get; set; }
    
    /// <summary>Pozisyon X (grid sistem)</summary>
    public int PositionX { get; set; }
    
    /// <summary>Pozisyon Y (grid sistem)</summary>
    public int PositionY { get; set; }
    
    /// <summary>Genişlik (grid birim)</summary>
    public int Width { get; set; } = 4;
    
    /// <summary>Yükseklik (grid birim)</summary>
    public int Height { get; set; } = 3;
    
    /// <summary>Görünür mü?</summary>
    public bool IsVisible { get; set; } = true;
    
    /// <summary>Sıralama</summary>
    public int Order { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
}

