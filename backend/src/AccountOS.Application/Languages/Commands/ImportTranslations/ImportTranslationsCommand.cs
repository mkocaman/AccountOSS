using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.ImportTranslations;

/// <summary>
/// JSON'dan çeviri import et command'ı
/// </summary>
public record ImportTranslationsCommand : IRequest<Result<ImportTranslationsResult>>
{
    /// <summary>Dil ID</summary>
    public Guid LanguageId { get; init; }
    
    /// <summary>Çeviri verisi (key-value)</summary>
    public Dictionary<string, string> Data { get; init; } = new();
    
    /// <summary>Mevcut çevirilerin üzerine yaz</summary>
    public bool Overwrite { get; init; }
}

/// <summary>
/// Import sonucu
/// </summary>
public record ImportTranslationsResult
{
    /// <summary>Oluşturulan sayısı</summary>
    public int Created { get; init; }
    
    /// <summary>Güncellenen sayısı</summary>
    public int Updated { get; init; }
    
    /// <summary>Başarısız sayısı</summary>
    public int Failed { get; init; }
}

