using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.SyncMissingTranslations;

/// <summary>
/// Eksik çevirileri varsayılan dilden senkronize et command handler
/// </summary>
public class SyncMissingTranslationsCommandHandler : IRequestHandler<SyncMissingTranslationsCommand, Result<SyncMissingTranslationsResult>>
{
    private readonly IApplicationDbContext _context;

    public SyncMissingTranslationsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SyncMissingTranslationsResult>> Handle(SyncMissingTranslationsCommand request, CancellationToken cancellationToken)
    {
        // Hedef dili kontrol et
        var targetLanguage = await _context.Languages.FindAsync(new object[] { request.TargetLanguageId }, cancellationToken);
        if (targetLanguage == null)
        {
            return Result<SyncMissingTranslationsResult>.Fail("Hedef dil bulunamadı");
        }

        // Varsayılan dili bul
        var defaultLanguage = await _context.Languages
            .Where(l => l.IsDefault && l.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (defaultLanguage == null)
        {
            return Result<SyncMissingTranslationsResult>.Fail("Varsayılan dil bulunamadı");
        }

        // Varsayılan dildeki tüm çevirileri al
        var defaultTranslations = await _context.Translations
            .Where(t => t.LanguageId == defaultLanguage.Id)
            .ToListAsync(cancellationToken);

        // Hedef dildeki mevcut çeviri key'lerini al
        var targetTranslationKeys = await _context.Translations
            .Where(t => t.LanguageId == request.TargetLanguageId)
            .Select(t => t.Key)
            .ToListAsync(cancellationToken);

        int synced = 0;

        // Eksik çevirileri ekle
        foreach (var defaultTranslation in defaultTranslations)
        {
            if (!targetTranslationKeys.Contains(defaultTranslation.Key))
            {
                var newTranslation = new Translation
                {
                    Id = Guid.NewGuid(),
                    LanguageId = request.TargetLanguageId,
                    Key = defaultTranslation.Key,
                    Value = defaultTranslation.Value, // Varsayılan dilden kopyala
                    Category = defaultTranslation.Category,
                    Description = $"[AUTO-SYNCED from {defaultLanguage.Code}] {defaultTranslation.Description}",
                    CreatedAt = DateTime.UtcNow
                };

                await _context.Translations.AddAsync(newTranslation, cancellationToken);
                synced++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var result = new SyncMissingTranslationsResult
        {
            Synced = synced
        };

        return Result<SyncMissingTranslationsResult>.Ok(result);
    }
}

