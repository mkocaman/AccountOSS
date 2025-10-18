using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.UpdateLanguage;

/// <summary>
/// Dil güncelleme komutu (Owner only)
/// </summary>
public record UpdateLanguageCommand : IRequest<Result<LanguageDto>>
{
    /// <summary>Dil ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Dil adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Yerel dil adı</summary>
    public string NativeName { get; init; } = string.Empty;
    
    /// <summary>Bayrak icon</summary>
    public string? FlagIcon { get; init; }
    
    /// <summary>RTL mi?</summary>
    public bool IsRtl { get; init; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; init; }
}

