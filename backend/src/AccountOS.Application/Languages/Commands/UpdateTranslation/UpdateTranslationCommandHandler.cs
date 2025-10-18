using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.UpdateTranslation;

/// <summary>
/// Çeviri güncelleme komut işleyicisi
/// </summary>
public class UpdateTranslationCommandHandler : IRequestHandler<UpdateTranslationCommand, Result<TranslationDto>>
{
    private readonly IApplicationDbContext _context;

    public UpdateTranslationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TranslationDto>> Handle(UpdateTranslationCommand request, CancellationToken cancellationToken)
    {
        var translation = await _context.Translations
            .Include(t => t.Language)
            .Where(t => t.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (translation == null)
            return Result<TranslationDto>.Fail("Çeviri bulunamadı");

        translation.Value = request.Value;
        translation.Category = request.Category;
        translation.Description = request.Description;
        translation.UpdatedAt = DateTime.UtcNow;
        translation.UpdatedBy = Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new TranslationDto
        {
            Id = translation.Id,
            LanguageCode = translation.Language.Code,
            Key = translation.Key,
            Value = translation.Value,
            Category = translation.Category,
            Description = translation.Description
        };

        return Result<TranslationDto>.Ok(dto);
    }
}

