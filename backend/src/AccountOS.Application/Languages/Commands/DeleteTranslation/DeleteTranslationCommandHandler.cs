using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Languages.Commands.DeleteTranslation;

/// <summary>
/// Çeviri silme komut işleyicisi
/// </summary>
public class DeleteTranslationCommandHandler : IRequestHandler<DeleteTranslationCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteTranslationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteTranslationCommand request, CancellationToken cancellationToken)
    {
        var translation = await _context.Translations
            .Where(t => t.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (translation == null)
            return Result<bool>.Fail("Çeviri bulunamadı");

        _context.Translations.Remove(translation);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

