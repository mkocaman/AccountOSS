using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Queries.GetDefaultLanguage;

/// <summary>
/// Varsayılan dili getir query handler
/// </summary>
public class GetDefaultLanguageQueryHandler : IRequestHandler<GetDefaultLanguageQuery, Result<LanguageDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDefaultLanguageQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LanguageDto>> Handle(GetDefaultLanguageQuery request, CancellationToken cancellationToken)
    {
        var language = await _context.Languages
            .Where(l => l.IsDefault && l.IsActive)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
        {
            // Varsayılan dil yoksa ilk aktif dili döndür
            language = await _context.Languages
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
                .FirstOrDefaultAsync(cancellationToken);
        }

        if (language == null)
        {
            return Result<LanguageDto>.Fail("Hiçbir aktif dil bulunamadı");
        }

        return Result<LanguageDto>.Ok(language);
    }
}

