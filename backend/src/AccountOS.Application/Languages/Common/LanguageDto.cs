namespace AccountOS.Application.Languages.Common;

/// <summary>
/// Dil DTO
/// </summary>
public record LanguageDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Dil kodu</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Dil adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Yerel dil adı</summary>
    public string NativeName { get; init; } = string.Empty;
    
    /// <summary>Bayrak icon</summary>
    public string? FlagIcon { get; init; }
    
    /// <summary>RTL mi?</summary>
    public bool IsRtl { get; init; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Varsayılan dil mi?</summary>
    public bool IsDefault { get; init; }
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; init; }
}

