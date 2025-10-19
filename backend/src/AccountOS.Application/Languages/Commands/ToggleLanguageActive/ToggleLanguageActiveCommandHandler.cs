using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;

namespace AccountOS.Application.Languages.Commands.ToggleLanguageActive;

/// <summary>
/// Dil aktif/pasif durumu değiştir command handler
/// </summary>
public class ToggleLanguageActiveCommandHandler : IRequestHandler<ToggleLanguageActiveCommand, Result<LanguageDto>>
{
    private readonly IApplicationDbContext _context;

    public ToggleLanguageActiveCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LanguageDto>> Handle(ToggleLanguageActiveCommand request, CancellationToken cancellationToken)
    {
        // Dili bul
        var language = await _context.Languages.FindAsync(new object[] { request.LanguageId }, cancellationToken);
        if (language == null)
        {
            return Result<LanguageDto>.Fail("Dil bulunamadı");
        }

        // Varsayılan dil pasif yapılamaz
        if (language.IsDefault && language.IsActive)
        {
            return Result<LanguageDto>.Fail("Varsayılan dil pasif yapılamaz");
        }

        // Durumu değiştir
        language.IsActive = !language.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        var result = new LanguageDto
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

        return Result<LanguageDto>.Ok(result);
    }
}

