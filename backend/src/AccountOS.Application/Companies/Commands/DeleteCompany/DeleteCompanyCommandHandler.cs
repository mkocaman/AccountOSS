using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Commands.DeleteCompany;

/// <summary>
/// Şirket silme komut işleyicisi
/// </summary>
public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteCompanyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Kullanıcının bu şirkete Owner olarak erişimi var mı?
        var userCompany = await _context.UserCompanies
            .Where(uc => uc.UserId == userId && uc.CompanyId == request.Id && uc.IsActive)
            .Include(uc => uc.Company)
            .FirstOrDefaultAsync(cancellationToken);

        if (userCompany == null)
            return Result<bool>.Fail("Şirket bulunamadı veya erişim yetkiniz yok");

        // Sadece Owner silebilir
        if (userCompany.Role != "Owner")
            return Result<bool>.Fail("Şirketi silmek için Owner yetkisi gereklidir");

        var company = userCompany.Company;

        // Soft delete
        company.IsDeleted = true;
        company.DeletedAt = DateTime.UtcNow;
        company.DeletedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

