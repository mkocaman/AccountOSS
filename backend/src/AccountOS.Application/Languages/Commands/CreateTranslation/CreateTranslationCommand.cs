using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.CreateTranslation;

/// <summary>
/// Çeviri oluşturma/güncelleme komutu (Upsert)
/// </summary>
public record CreateTranslationCommand : IRequest<Result<TranslationDto>>
{
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

