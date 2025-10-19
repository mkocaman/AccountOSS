using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.ImportTranslations;

/// <summary>
/// JSON'dan çeviri import et command handler
/// </summary>
public class ImportTranslationsCommandHandler : IRequestHandler<ImportTranslationsCommand, Result<ImportTranslationsResult>>
{
    private readonly IApplicationDbContext _context;

    public ImportTranslationsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ImportTranslationsResult>> Handle(ImportTranslationsCommand request, CancellationToken cancellationToken)
    {
        // Dili kontrol et
        var language = await _context.Languages.FindAsync(new object[] { request.LanguageId }, cancellationToken);
        if (language == null)
        {
            return Result<ImportTranslationsResult>.Fail("Dil bulunamadı");
        }

        int created = 0;
        int updated = 0;
        int failed = 0;

        foreach (var kvp in request.Data)
        {
            try
            {
                var key = kvp.Key;
                var value = kvp.Value;

                // Kategoriyi key'den çıkar (örn: "common.save" -> "common")
                var category = key.Contains('.') ? key.Split('.')[0] : "general";

                // Mevcut çeviri var mı kontrol et
                var existing = await _context.Translations
                    .FirstOrDefaultAsync(t => t.LanguageId == request.LanguageId && t.Key == key, cancellationToken);

                if (existing != null)
                {
                    if (request.Overwrite)
                    {
                        existing.Value = value;
                        existing.Category = category;
                        updated++;
                    }
                    else
                    {
                        // Üzerine yazma kapalıysa atla
                        continue;
                    }
                }
                else
                {
                    // Yeni oluştur
                    var translation = new Translation
                    {
                        Id = Guid.NewGuid(),
                        LanguageId = request.LanguageId,
                        Key = key,
                        Value = value,
                        Category = category,
                        CreatedAt = DateTime.UtcNow
                    };

                    await _context.Translations.AddAsync(translation, cancellationToken);
                    created++;
                }
            }
            catch
            {
                failed++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var result = new ImportTranslationsResult
        {
            Created = created,
            Updated = updated,
            Failed = failed
        };

        return Result<ImportTranslationsResult>.Ok(result);
    }
}

