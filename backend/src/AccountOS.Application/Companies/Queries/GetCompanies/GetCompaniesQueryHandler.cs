using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Companies.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Queries.GetCompanies;

/// <summary>
/// Şirket listesi sorgu işleyicisi
/// </summary>
public class GetCompaniesQueryHandler : IRequestHandler<GetCompaniesQuery, Result<List<CompanyDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCompaniesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CompanyDto>>> Handle(GetCompaniesQuery request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        if (_currentUser.UserId == null)
            return Result<List<CompanyDto>>.Fail("Kullanıcı oturumu bulunamadı");

        var userId = _currentUser.UserId.Value;

        // Kullanıcının erişebildiği şirketleri getir
        var companies = await _context.UserCompanies
            .Where(uc => uc.UserId == userId && uc.IsActive)
            .Include(uc => uc.Company)
            .Select(uc => new CompanyDto
            {
                Id = uc.Company.Id,
                Name = uc.Company.Name,
                TaxNumber = uc.Company.TaxNumber,
                TaxOffice = uc.Company.TaxOffice,
                Phone = uc.Company.Phone,
                Email = uc.Company.Email,
                Address = uc.Company.Address,
                City = uc.Company.City,
                Country = uc.Company.Country,
                BaseCurrency = uc.Company.BaseCurrency,
                DefaultLanguage = uc.Company.DefaultLanguage,
                TimeZone = uc.Company.TimeZone,
                LogoUrl = uc.Company.LogoUrl,
                PrimaryColor = uc.Company.PrimaryColor,
                IsActive = uc.Company.IsActive,
                CreatedAt = uc.Company.CreatedAt,
                UserRole = uc.Role,
                IsDefaultForUser = uc.IsDefault
            })
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        return Result<List<CompanyDto>>.Ok(companies);
    }
}

