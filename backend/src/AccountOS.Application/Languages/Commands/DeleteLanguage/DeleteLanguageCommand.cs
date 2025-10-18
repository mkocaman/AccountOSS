using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.DeleteLanguage;

/// <summary>
/// Dil silme komutu (Owner only)
/// </summary>
public record DeleteLanguageCommand(Guid Id) : IRequest<Result<bool>>;

