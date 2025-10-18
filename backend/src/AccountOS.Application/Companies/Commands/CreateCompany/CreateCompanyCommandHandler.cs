using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Companies.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Commands.CreateCompany;

/// <summary>
/// Şirket oluşturma komut işleyicisi
/// </summary>
public class CreateCompanyCommandHandler : IRequestHandler<CreateCompanyCommand, Result<CompanyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateCompanyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanyDto>> Handle(CreateCompanyCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<CompanyDto>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Aynı isimde şirket var mı kontrol et
        var existingCompany = await _context.Companies
            .Where(c => c.Name.ToLower() == request.Name.ToLower())
            .FirstOrDefaultAsync(cancellationToken);

        if (existingCompany != null)
            return Result<CompanyDto>.Fail("Bu isimde bir şirket zaten mevcut");

        // Yeni şirket oluştur
        var company = new Company
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            TaxNumber = request.TaxNumber,
            TaxOffice = request.TaxOffice,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            City = request.City,
            Country = request.Country,
            BaseCurrency = request.BaseCurrency,
            DefaultLanguage = request.DefaultLanguage,
            TimeZone = request.TimeZone,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Companies.Add(company);

        // Kullanıcıyı şirkete Owner olarak ata
        var userCompany = new UserCompany
        {
            UserId = userId,
            CompanyId = company.Id,
            Role = "Owner",
            IsActive = true,
            IsDefault = true, // İlk şirket varsayılan olsun
            JoinedAt = DateTime.UtcNow
        };

        _context.UserCompanies.Add(userCompany);

        // Owner rolünü ekle
        var userRole = new UserRole
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            RoleName = "Owner",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.UserRoles.Add(userRole);

        await _context.SaveChangesAsync(cancellationToken);

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
            UserRole = "Owner",
            IsDefaultForUser = true
        };

        return Result<CompanyDto>.Ok(dto);
    }
}

