using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetTranslationsForLanguage;

/// <summary>
/// Dil için çevirileri flat key-value olarak getir query handler
/// </summary>
public class GetTranslationsForLanguageQueryHandler : IRequestHandler<GetTranslationsForLanguageQuery, Result<Dictionary<string, string>>>
{
    private readonly IApplicationDbContext _context;

    public GetTranslationsForLanguageQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Dictionary<string, string>>> Handle(GetTranslationsForLanguageQuery request, CancellationToken cancellationToken)
    {
        // Dili bul
        var language = await _context.Languages
            .Where(l => l.Code.ToUpper() == request.LanguageCode.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
        {
            return Result<Dictionary<string, string>>.Fail($"Dil bulunamadı: {request.LanguageCode}");
        }

        // Çevirileri flat dictionary olarak getir
        var translations = await _context.Translations
            .Where(t => t.LanguageId == language.Id)
            .ToDictionaryAsync(
                t => t.Key,
                t => t.Value,
                cancellationToken
            );

        return Result<Dictionary<string, string>>.Ok(translations);
    }
}

