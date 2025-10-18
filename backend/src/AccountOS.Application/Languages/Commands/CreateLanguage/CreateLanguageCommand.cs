using AccountOS.Application.Common;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.CreateLanguage;

/// <summary>
/// Yeni dil oluşturma komutu (Owner only)
/// </summary>
public record CreateLanguageCommand : IRequest<Result<LanguageDto>>
{
    /// <summary>Dil kodu (ISO 639-1 - örn: TR, EN)</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Dil adı (İngilizce)</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Yerel dil adı</summary>
    public string NativeName { get; init; } = string.Empty;
    
    /// <summary>Bayrak emoji/icon</summary>
    public string? FlagIcon { get; init; }
    
    /// <summary>RTL mi?</summary>
    public bool IsRtl { get; init; }
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; init; }
}

