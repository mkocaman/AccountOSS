using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Queries.GetDefaultLanguage;

/// <summary>
/// Varsayılan dili getir query'si
/// </summary>
public record GetDefaultLanguageQuery : IRequest<Result<LanguageDto>>;

