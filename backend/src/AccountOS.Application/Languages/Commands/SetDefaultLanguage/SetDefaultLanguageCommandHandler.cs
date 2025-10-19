using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.SetDefaultLanguage;

/// <summary>
/// Varsayılan dil ayarla command handler
/// </summary>
public class SetDefaultLanguageCommandHandler : IRequestHandler<SetDefaultLanguageCommand, Result<LanguageDto>>
{
    private readonly IApplicationDbContext _context;

    public SetDefaultLanguageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LanguageDto>> Handle(SetDefaultLanguageCommand request, CancellationToken cancellationToken)
    {
        // Dili bul
        var language = await _context.Languages.FindAsync(new object[] { request.LanguageId }, cancellationToken);
        if (language == null)
        {
            return Result<LanguageDto>.Fail("Dil bulunamadı");
        }

        // Dilin aktif olması gerekiyor
        if (!language.IsActive)
        {
            return Result<LanguageDto>.Fail("Pasif bir dil varsayılan yapılamaz");
        }

        // Mevcut varsayılan dili kaldır
        var currentDefault = await _context.Languages
            .Where(l => l.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var lang in currentDefault)
        {
            lang.IsDefault = false;
        }

        // Yeni varsayılan dili ayarla
        language.IsDefault = true;

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

