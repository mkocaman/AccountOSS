using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetTranslationsForLanguage;

/// <summary>
/// Dil için çevirileri flat key-value olarak getir (i18n için)
/// </summary>
public record GetTranslationsForLanguageQuery : IRequest<Result<Dictionary<string, string>>>
{
    /// <summary>Dil kodu (TR, EN, vs.)</summary>
    public string LanguageCode { get; init; } = string.Empty;
}

