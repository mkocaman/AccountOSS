using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetTranslations;

/// <summary>
/// Belirli dil için tüm çevirileri getir sorgusu
/// </summary>
public record GetTranslationsQuery : IRequest<Result<Dictionary<string, string>>>
{
    /// <summary>Dil kodu (TR, EN, RU, vb.)</summary>
    public string LanguageCode { get; init; } = "TR";
    
    /// <summary>Kategori filtresi (opsiyonel)</summary>
    public string? Category { get; init; }
}

