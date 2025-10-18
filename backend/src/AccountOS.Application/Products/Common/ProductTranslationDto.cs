namespace AccountOS.Application.Products.Common;

/// <summary>
/// Ürün çeviri DTO
/// </summary>
public record ProductTranslationDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Dil kodu</summary>
    public string LanguageCode { get; init; } = string.Empty;
    
    /// <summary>Ürün adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

