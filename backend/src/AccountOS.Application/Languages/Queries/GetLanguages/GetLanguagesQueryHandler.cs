using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetLanguages;

/// <summary>
/// Dil listesi sorgu işleyicisi
/// </summary>
public class GetLanguagesQueryHandler : IRequestHandler<GetLanguagesQuery, Result<List<LanguageDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetLanguagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<LanguageDto>>> Handle(GetLanguagesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Languages.AsQueryable();

        if (request.ActiveOnly)
            query = query.Where(l => l.IsActive);

        var languages = await query
            .OrderBy(l => l.DisplayOrder)
            .ThenBy(l => l.Code)
            .Select(l => new LanguageDto
            {
                Id = l.Id,
                Code = l.Code,
                Name = l.Name,
                NativeName = l.NativeName,
                FlagIcon = l.FlagIcon,
                IsRtl = l.IsRtl,
                IsActive = l.IsActive,
                IsDefault = l.IsDefault,
                DisplayOrder = l.DisplayOrder
            })
            .ToListAsync(cancellationToken);

        return Result<List<LanguageDto>>.Ok(languages);
    }
}

