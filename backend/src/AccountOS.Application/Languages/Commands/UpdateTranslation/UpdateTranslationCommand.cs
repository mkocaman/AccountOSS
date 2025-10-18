using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.UpdateTranslation;

/// <summary>
/// Çeviri güncelleme komutu (Owner only)
/// </summary>
public record UpdateTranslationCommand : IRequest<Result<TranslationDto>>
{
    /// <summary>Çeviri ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Değer</summary>
    public string Value { get; init; } = string.Empty;
    
    /// <summary>Kategori</summary>
    public string? Category { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
}

