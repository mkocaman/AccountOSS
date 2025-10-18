using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Commands.InviteUser;

/// <summary>
/// Kullanıcı davet etme komut işleyicisi
/// </summary>
public class InviteUserToCompanyCommandHandler : IRequestHandler<InviteUserToCompanyCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public InviteUserToCompanyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(InviteUserToCompanyCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Kullanıcının bu şirkette Owner veya Admin yetkisi var mı?
        var userCompany = await _context.UserCompanies
            .Where(uc => uc.UserId == userId && uc.CompanyId == request.CompanyId && uc.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (userCompany == null)
            return Result<bool>.Fail("Şirket bulunamadı veya erişim yetkiniz yok");

        if (userCompany.Role != "Owner" && userCompany.Role != "Admin")
            return Result<bool>.Fail("Kullanıcı davet etmek için yetkiniz yok");

        // Şirketi getir (user limit kontrolü için)
        var company = await _context.Companies
            .Where(c => c.Id == request.CompanyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (company == null)
            return Result<bool>.Fail("Şirket bulunamadı");

        // YENI: Kullanıcı limiti kontrolü
        var currentUserCount = await _context.UserCompanies
            .CountAsync(uc => uc.CompanyId == request.CompanyId && uc.IsActive, cancellationToken);

        if (currentUserCount >= company.MaxUsers)
        {
            return Result<bool>.Fail(
                $"Kullanıcı limiti aşıldı! Maksimum: {company.MaxUsers}, Mevcut: {currentUserCount}. " +
                "Lütfen planınızı yükseltin veya mevcut kullanıcıları silin.");
        }

        // Email'e göre kullanıcıyı bul
        var invitedUser = await _context.Users
            .Where(u => u.Email.ToLower() == request.Email.ToLower())
            .FirstOrDefaultAsync(cancellationToken);

        if (invitedUser == null)
            return Result<bool>.Fail("Bu email adresine kayıtlı kullanıcı bulunamadı");

        // Kullanıcı zaten şirkete dahil mi?
        var existingAssignment = await _context.UserCompanies
            .Where(uc => uc.UserId == invitedUser.Id && uc.CompanyId == request.CompanyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingAssignment != null)
        {
            if (existingAssignment.IsActive)
                return Result<bool>.Fail("Kullanıcı zaten bu şirkete dahil");
            
            // Pasif ise aktif et
            existingAssignment.IsActive = true;
            existingAssignment.Role = request.Role;
            existingAssignment.JoinedAt = DateTime.UtcNow;
        }
        else
        {
            // Yeni atama oluştur
            var newAssignment = new UserCompany
            {
                UserId = invitedUser.Id,
                CompanyId = request.CompanyId,
                Role = request.Role,
                IsActive = true,
                IsDefault = false, // Davet edilen kullanıcı için varsayılan değil
                JoinedAt = DateTime.UtcNow
            };

            _context.UserCompanies.Add(newAssignment);
        }

        await _context.SaveChangesAsync(cancellationToken);

        // TODO: Email gönderme servisi (sonra eklenecek)
        // await _emailService.SendInvitationEmailAsync(invitedUser.Email, company.Name);

        return Result<bool>.Ok(true);
    }
}

