using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Languages.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.CreateTranslation;

/// <summary>
/// Çeviri oluşturma komut işleyicisi
/// </summary>
public class CreateTranslationCommandHandler : IRequestHandler<CreateTranslationCommand, Result<TranslationDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateTranslationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<TranslationDto>> Handle(CreateTranslationCommand request, CancellationToken cancellationToken)
    {
        // Dil var mı?
        var language = await _context.Languages
            .Where(l => l.Code.ToUpper() == request.LanguageCode.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
            return Result<TranslationDto>.Fail($"Dil kodu '{request.LanguageCode}' bulunamadı");

        // Aynı key için çeviri var mı? (upsert)
        var existingTranslation = await _context.Translations
            .Where(t => t.LanguageId == language.Id && t.Key == request.Key)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingTranslation != null)
        {
            // Mevcut çeviriyi güncelle (upsert)
            existingTranslation.Value = request.Value;
            existingTranslation.Category = request.Category;
            existingTranslation.Description = request.Description;

            await _context.SaveChangesAsync(cancellationToken);

            return Result<TranslationDto>.Ok(new TranslationDto
            {
                Id = existingTranslation.Id,
                LanguageCode = language.Code,
                Key = existingTranslation.Key,
                Value = existingTranslation.Value,
                Category = existingTranslation.Category,
                Description = existingTranslation.Description
            });
        }

        // Yeni çeviri oluştur
        var translation = new Translation
        {
            Id = Guid.NewGuid(),
            LanguageId = language.Id,
            Key = request.Key,
            Value = request.Value,
            Category = request.Category,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.Empty
        };

        _context.Translations.Add(translation);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new TranslationDto
        {
            Id = translation.Id,
            LanguageCode = language.Code,
            Key = translation.Key,
            Value = translation.Value,
            Category = translation.Category,
            Description = translation.Description
        };

        return Result<TranslationDto>.Ok(dto);
    }
}

