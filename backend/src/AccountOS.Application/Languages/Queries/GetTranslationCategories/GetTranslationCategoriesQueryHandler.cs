using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetTranslationCategories;

/// <summary>
/// Çeviri kategorilerini getir query handler
/// </summary>
public class GetTranslationCategoriesQueryHandler : IRequestHandler<GetTranslationCategoriesQuery, Result<List<string>>>
{
    private readonly IApplicationDbContext _context;

    public GetTranslationCategoriesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<string>>> Handle(GetTranslationCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = await _context.Translations
            .Where(t => !string.IsNullOrEmpty(t.Category))
            .Select(t => t.Category!)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Ok(categories);
    }
}

