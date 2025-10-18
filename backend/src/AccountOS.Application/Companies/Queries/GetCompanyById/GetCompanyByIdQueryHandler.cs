using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Companies.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Companies.Queries.GetCompanyById;

/// <summary>
/// Şirket detayı sorgu işleyicisi
/// </summary>
public class GetCompanyByIdQueryHandler : IRequestHandler<GetCompanyByIdQuery, Result<CompanyDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCompanyByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanyDto>> Handle(GetCompanyByIdQuery request, CancellationToken cancellationToken)
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

        // DTO'ya dönüştür
        var dto = new CompanyDto
        {
            Id = userCompany.Company.Id,
            Name = userCompany.Company.Name,
            TaxNumber = userCompany.Company.TaxNumber,
            TaxOffice = userCompany.Company.TaxOffice,
            Phone = userCompany.Company.Phone,
            Email = userCompany.Company.Email,
            Address = userCompany.Company.Address,
            City = userCompany.Company.City,
            Country = userCompany.Company.Country,
            BaseCurrency = userCompany.Company.BaseCurrency,
            DefaultLanguage = userCompany.Company.DefaultLanguage,
            TimeZone = userCompany.Company.TimeZone,
            LogoUrl = userCompany.Company.LogoUrl,
            PrimaryColor = userCompany.Company.PrimaryColor,
            IsActive = userCompany.Company.IsActive,
            CreatedAt = userCompany.Company.CreatedAt,
            UserRole = userCompany.Role,
            IsDefaultForUser = userCompany.IsDefault
        };

        return Result<CompanyDto>.Ok(dto);
    }
}

