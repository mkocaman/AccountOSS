using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.DeleteTranslation;

/// <summary>
/// Çeviri silme komutu (Owner only)
/// </summary>
public record DeleteTranslationCommand(Guid Id) : IRequest<Result<bool>>;

