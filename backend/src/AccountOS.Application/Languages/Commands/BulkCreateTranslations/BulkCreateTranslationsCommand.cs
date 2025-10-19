using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.BulkCreateTranslations;

/// <summary>
/// Toplu çeviri ekleme command'ı
/// </summary>
public record BulkCreateTranslationsCommand : IRequest<Result<BulkCreateTranslationsResult>>
{
    /// <summary>Dil ID</summary>
    public Guid LanguageId { get; init; }
    
    /// <summary>Çeviriler</summary>
    public List<TranslationItem> Translations { get; init; } = new();
}

/// <summary>
/// Çeviri item
/// </summary>
public record TranslationItem
{
    /// <summary>Anahtar</summary>
    public string Key { get; init; } = string.Empty;
    
    /// <summary>Değer</summary>
    public string Value { get; init; } = string.Empty;
    
    /// <summary>Kategori</summary>
    public string? Category { get; init; }
}

/// <summary>
/// Toplu ekleme sonucu
/// </summary>
public record BulkCreateTranslationsResult
{
    /// <summary>Oluşturulan sayısı</summary>
    public int Created { get; init; }
    
    /// <summary>Başarısız sayısı</summary>
    public int Failed { get; init; }
}

