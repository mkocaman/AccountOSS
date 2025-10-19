using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.ToggleLanguageActive;

/// <summary>
/// Dil aktif/pasif durumu değiştir command'ı
/// </summary>
public record ToggleLanguageActiveCommand(Guid LanguageId) : IRequest<Result<LanguageDto>>;

