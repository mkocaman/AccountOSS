using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.CreateLanguage;

/// <summary>
/// Dil oluşturma komut işleyicisi
/// </summary>
public class CreateLanguageCommandHandler : IRequestHandler<CreateLanguageCommand, Result<LanguageDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateLanguageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<LanguageDto>> Handle(CreateLanguageCommand request, CancellationToken cancellationToken)
    {
        // Aynı kod ile dil var mı?
        var existingLanguage = await _context.Languages
            .Where(l => l.Code.ToUpper() == request.Code.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (existingLanguage != null)
            return Result<LanguageDto>.Fail($"'{request.Code}' dil kodu zaten mevcut");

        // Yeni dil oluştur
        var language = new Language
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            NativeName = request.NativeName,
            FlagIcon = request.FlagIcon,
            IsRtl = request.IsRtl,
            IsActive = true,
            IsDefault = false, // İlk dil TR, default olamaz
            DisplayOrder = request.DisplayOrder,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.Empty
        };

        _context.Languages.Add(language);
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

