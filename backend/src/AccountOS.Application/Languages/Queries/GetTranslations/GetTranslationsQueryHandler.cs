using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetTranslations;

/// <summary>
/// Çeviri listesi sorgu işleyicisi
/// </summary>
public class GetTranslationsQueryHandler : IRequestHandler<GetTranslationsQuery, Result<Dictionary<string, string>>>
{
    private readonly IApplicationDbContext _context;

    public GetTranslationsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Dictionary<string, string>>> Handle(GetTranslationsQuery request, CancellationToken cancellationToken)
    {
        // Dil var mı kontrol et
        var language = await _context.Languages
            .Where(l => l.Code.ToUpper() == request.LanguageCode.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
            return Result<Dictionary<string, string>>.Fail($"Dil kodu '{request.LanguageCode}' bulunamadı");

        // Çevirileri getir
        var query = _context.Translations
            .Where(t => t.LanguageId == language.Id);

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(t => t.Category == request.Category);

        var translations = await query
            .Select(t => new { t.Key, t.Value })
            .ToListAsync(cancellationToken);

        // Dictionary'ye dönüştür
        var dictionary = translations.ToDictionary(t => t.Key, t => t.Value);

        return Result<Dictionary<string, string>>.Ok(dictionary);
    }
}

