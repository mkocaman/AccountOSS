using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetLanguages;

/// <summary>
/// Dilleri listele sorgusu
/// </summary>
public record GetLanguagesQuery : IRequest<Result<List<LanguageDto>>>
{
    /// <summary>Sadece aktif dilleri getir</summary>
    public bool ActiveOnly { get; init; } = true;
}

