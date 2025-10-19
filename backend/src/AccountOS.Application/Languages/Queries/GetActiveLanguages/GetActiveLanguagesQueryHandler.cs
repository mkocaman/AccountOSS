using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetActiveLanguages;

/// <summary>
/// Sadece aktif dilleri getir query handler
/// </summary>
public class GetActiveLanguagesQueryHandler : IRequestHandler<GetActiveLanguagesQuery, Result<List<LanguageDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetActiveLanguagesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<LanguageDto>>> Handle(GetActiveLanguagesQuery request, CancellationToken cancellationToken)
    {
        var languages = await _context.Languages
            .Where(l => l.IsActive)
            .OrderBy(l => l.DisplayOrder)
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

