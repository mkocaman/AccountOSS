using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Dil entity
/// </summary>
public class Language : BaseEntity
{
    /// <summary>Dil kodu (ISO 639-1 - örn: TR, EN, RU)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Dil adı (İngilizce)</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Yerel dil adı (Türkçe, English, Русский)</summary>
    public string NativeName { get; set; } = string.Empty;
    
    /// <summary>Bayrak emoji/icon</summary>
    public string? FlagIcon { get; set; }
    
    /// <summary>Sağdan sola yazım mı? (Arabic için true)</summary>
    public bool IsRtl { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Varsayılan dil mi?</summary>
    public bool IsDefault { get; set; }
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; set; }
    
    // Navigation Properties
    /// <summary>Bu dile ait çeviriler</summary>
    public ICollection<Translation> Translations { get; set; } = new List<Translation>();
}

