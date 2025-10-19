using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.BulkCreateTranslations;

/// <summary>
/// Toplu çeviri ekleme command handler
/// </summary>
public class BulkCreateTranslationsCommandHandler : IRequestHandler<BulkCreateTranslationsCommand, Result<BulkCreateTranslationsResult>>
{
    private readonly IApplicationDbContext _context;

    public BulkCreateTranslationsCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BulkCreateTranslationsResult>> Handle(BulkCreateTranslationsCommand request, CancellationToken cancellationToken)
    {
        // Dili kontrol et
        var language = await _context.Languages.FindAsync(new object[] { request.LanguageId }, cancellationToken);
        if (language == null)
        {
            return Result<BulkCreateTranslationsResult>.Fail("Dil bulunamadı");
        }

        int created = 0;
        int failed = 0;

        foreach (var item in request.Translations)
        {
            try
            {
                // Mevcut çeviri var mı kontrol et
                var existing = await _context.Translations
                    .FirstOrDefaultAsync(t => t.LanguageId == request.LanguageId && t.Key == item.Key, cancellationToken);

                if (existing != null)
                {
                    // Güncelle
                    existing.Value = item.Value;
                    if (!string.IsNullOrWhiteSpace(item.Category))
                    {
                        existing.Category = item.Category;
                    }
                }
                else
                {
                    // Yeni oluştur
                    var translation = new Translation
                    {
                        Id = Guid.NewGuid(),
                        LanguageId = request.LanguageId,
                        Key = item.Key,
                        Value = item.Value,
                        Category = item.Category ?? item.Key.Split('.').FirstOrDefault() ?? "general",
                        CreatedAt = DateTime.UtcNow
                    };

                    await _context.Translations.AddAsync(translation, cancellationToken);
                }

                created++;
            }
            catch
            {
                failed++;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        var result = new BulkCreateTranslationsResult
        {
            Created = created,
            Failed = failed
        };

        return Result<BulkCreateTranslationsResult>.Ok(result);
    }
}

