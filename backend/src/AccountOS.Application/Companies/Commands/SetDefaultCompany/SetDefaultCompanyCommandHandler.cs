using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Commands.SetDefaultCompany;

/// <summary>
/// Varsayılan şirket belirleme komut işleyicisi
/// </summary>
public class SetDefaultCompanyCommandHandler : IRequestHandler<SetDefaultCompanyCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SetDefaultCompanyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(SetDefaultCompanyCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Kullanıcının bu şirkete erişimi var mı?
        var targetUserCompany = await _context.UserCompanies
            .Where(uc => uc.UserId == userId && uc.CompanyId == request.CompanyId && uc.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (targetUserCompany == null)
            return Result<bool>.Fail("Şirket bulunamadı veya erişim yetkiniz yok");

        // Kullanıcının tüm şirketlerini getir
        var userCompanies = await _context.UserCompanies
            .Where(uc => uc.UserId == userId)
            .ToListAsync(cancellationToken);

        // Tüm şirketlerin IsDefault'unu false yap
        foreach (var uc in userCompanies)
        {
            uc.IsDefault = false;
        }

        // Seçilen şirketi varsayılan yap
        targetUserCompany.IsDefault = true;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

