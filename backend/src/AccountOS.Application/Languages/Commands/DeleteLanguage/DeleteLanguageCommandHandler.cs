using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.DeleteLanguage;

/// <summary>
/// Dil silme komut işleyicisi
/// </summary>
public class DeleteLanguageCommandHandler : IRequestHandler<DeleteLanguageCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteLanguageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteLanguageCommand request, CancellationToken cancellationToken)
    {
        // Dil var mı?
        var language = await _context.Languages
            .Where(l => l.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (language == null)
            return Result<bool>.Fail("Dil bulunamadı");

        // Default dil silinemez
        if (language.IsDefault)
            return Result<bool>.Fail("Varsayılan dil silinemez");

        // Çevirileri kontrol et
        var translationCount = await _context.Translations
            .CountAsync(t => t.LanguageId == language.Id, cancellationToken);

        if (translationCount > 0)
            return Result<bool>.Fail($"Bu dile ait {translationCount} çeviri var. Önce çevirileri silin.");

        // Sil (hard delete - çünkü audit trail gerekmez)
        _context.Languages.Remove(language);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

