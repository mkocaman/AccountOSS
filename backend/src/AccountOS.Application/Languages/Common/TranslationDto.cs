namespace AccountOS.Application.Languages.Common;

/// <summary>
/// Çeviri DTO
/// </summary>
public record TranslationDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Dil kodu</summary>
    public string LanguageCode { get; init; } = string.Empty;
    
    /// <summary>Anahtar</summary>
    public string Key { get; init; } = string.Empty;
    
    /// <summary>Değer</summary>
    public string Value { get; init; } = string.Empty;
    
    /// <summary>Kategori</summary>
    public string? Category { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

