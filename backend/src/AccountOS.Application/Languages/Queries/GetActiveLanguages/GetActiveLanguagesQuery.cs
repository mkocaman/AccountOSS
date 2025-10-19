using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetActiveLanguages;

/// <summary>
/// Sadece aktif dilleri getir query'si
/// </summary>
public record GetActiveLanguagesQuery : IRequest<Result<List<LanguageDto>>>;

