using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.SetDefaultLanguage;

/// <summary>
/// Varsayılan dil ayarla command'ı
/// </summary>
public record SetDefaultLanguageCommand(Guid LanguageId) : IRequest<Result<LanguageDto>>;

