using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.SyncMissingTranslations;

/// <summary>
/// Eksik çevirileri varsayılan dilden senkronize et command'ı
/// </summary>
public record SyncMissingTranslationsCommand : IRequest<Result<SyncMissingTranslationsResult>>
{
    /// <summary>Hedef dil ID</summary>
    public Guid TargetLanguageId { get; init; }
}

/// <summary>
/// Senkronizasyon sonucu
/// </summary>
public record SyncMissingTranslationsResult
{
    /// <summary>Senkronize edilen sayı</summary>
    public int Synced { get; init; }
}

