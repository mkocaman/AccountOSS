using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Companies.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Commands.UpdateCompany;

/// <summary>
/// Şirket güncelleme komut işleyicisi
/// </summary>
public class UpdateCompanyCommandHandler : IRequestHandler<UpdateCompanyCommand, Result<CompanyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCompanyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanyDto>> Handle(UpdateCompanyCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<CompanyDto>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Kullanıcının bu şirkete erişimi var mı?
        var userCompany = await _context.UserCompanies
            .Where(uc => uc.UserId == userId && uc.CompanyId == request.Id && uc.IsActive)
            .Include(uc => uc.Company)
            .FirstOrDefaultAsync(cancellationToken);

        if (userCompany == null)
            return Result<CompanyDto>.Fail("Şirket bulunamadı veya erişim yetkiniz yok");

        // Sadece Owner veya Admin güncelleyebilir
        if (userCompany.Role != "Owner" && userCompany.Role != "Admin")
            return Result<CompanyDto>.Fail("Şirket bilgilerini güncellemek için yetkiniz yok");

        var company = userCompany.Company;

        // Aynı isimde başka şirket var mı?
        if (request.Name != company.Name)
        {
            var existingCompany = await _context.Companies
                .Where(c => c.Name.ToLower() == request.Name.ToLower() && c.Id != request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingCompany != null)
                return Result<CompanyDto>.Fail("Bu isimde bir şirket zaten mevcut");
        }

        // Şirket bilgilerini güncelle
        company.Name = request.Name;
        company.TaxNumber = request.TaxNumber;
        company.TaxOffice = request.TaxOffice;
        company.Phone = request.Phone;
        company.Email = request.Email;
        company.Address = request.Address;
        company.City = request.City;
        company.Country = request.Country;
        
        if (!string.IsNullOrWhiteSpace(request.BaseCurrency))
            company.BaseCurrency = request.BaseCurrency;
        
        if (!string.IsNullOrWhiteSpace(request.DefaultLanguage))
            company.DefaultLanguage = request.DefaultLanguage;
        
        if (!string.IsNullOrWhiteSpace(request.TimeZone))
            company.TimeZone = request.TimeZone;
        
        company.LogoUrl = request.LogoUrl;
        company.PrimaryColor = request.PrimaryColor;
        
        // MaxUsers güncellemesi (sadece Owner)
        if (request.MaxUsers.HasValue)
        {
            // Mevcut kullanıcı sayısını kontrol et
            var currentUserCount = await _context.UserCompanies
                .CountAsync(uc => uc.CompanyId == company.Id && uc.IsActive, cancellationToken);

            if (request.MaxUsers.Value < currentUserCount)
            {
                return Result<CompanyDto>.Fail(
                    $"Maksimum kullanıcı sayısı mevcut kullanıcı sayısından ({currentUserCount}) az olamaz");
            }

            company.MaxUsers = request.MaxUsers.Value;
        }
        
        company.UpdatedAt = DateTime.UtcNow;
        company.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        // Kullanıcı sayısını hesapla
        var userCount = await _context.UserCompanies
            .CountAsync(uc => uc.CompanyId == company.Id && uc.IsActive, cancellationToken);

        // DTO'ya dönüştür
        var dto = new CompanyDto
        {
            Id = company.Id,
            Name = company.Name,
            TaxNumber = company.TaxNumber,
            TaxOffice = company.TaxOffice,
            Phone = company.Phone,
            Email = company.Email,
            Address = company.Address,
            City = company.City,
            Country = company.Country,
            BaseCurrency = company.BaseCurrency,
            DefaultLanguage = company.DefaultLanguage,
            TimeZone = company.TimeZone,
            LogoUrl = company.LogoUrl,
            PrimaryColor = company.PrimaryColor,
            IsActive = company.IsActive,
            CreatedAt = company.CreatedAt,
            UserRole = userCompany.Role,
            IsDefaultForUser = userCompany.IsDefault,
            MaxUsers = company.MaxUsers,
            CurrentUserCount = userCount,
            IsUserLimitReached = userCount >= company.MaxUsers
        };

        return Result<CompanyDto>.Ok(dto);
    }
}

