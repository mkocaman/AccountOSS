using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.UpdateLanguage;

/// <summary>
/// Dil güncelleme komut işleyicisi
/// </summary>
public class UpdateLanguageCommandHandler : IRequestHandler<UpdateLanguageCommand, Result<LanguageDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdateLanguageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LanguageDto>> Handle(UpdateLanguageCommand request, CancellationToken cancellationToken)
    {
        // Dil var mı?
        var language = await _context.Languages
            .Where(l => l.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
            return Result<LanguageDto>.Fail("Dil bulunamadı");

        // Default dil deaktif edilemez
        if (language.IsDefault && !request.IsActive)
            return Result<LanguageDto>.Fail("Varsayılan dil deaktif edilemez");

        // Güncelle
        language.Name = request.Name;
        language.NativeName = request.NativeName;
        language.FlagIcon = request.FlagIcon;
        language.IsRtl = request.IsRtl;
        language.IsActive = request.IsActive;
        language.DisplayOrder = request.DisplayOrder;
        language.UpdatedAt = DateTime.UtcNow;
        language.UpdatedBy = Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new LanguageDto
        {
            Id = language.Id,
            Code = language.Code,
            Name = language.Name,
            NativeName = language.NativeName,
            FlagIcon = language.FlagIcon,
            IsRtl = language.IsRtl,
            IsActive = language.IsActive,
            IsDefault = language.IsDefault,
            DisplayOrder = language.DisplayOrder
        };

        return Result<LanguageDto>.Ok(dto);
    }
}

