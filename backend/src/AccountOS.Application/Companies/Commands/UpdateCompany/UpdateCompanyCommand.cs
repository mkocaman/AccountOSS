using AccountOS.Application.Common;
using AccountOS.Application.Companies.Common;
using MediatR;

namespace AccountOS.Application.Companies.Commands.UpdateCompany;

/// <summary>
/// Şirket bilgilerini güncelleme komutu
/// </summary>
public record UpdateCompanyCommand : IRequest<Result<CompanyDto>>
{
    /// <summary>Şirket ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Şirket adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Vergi numarası</summary>
    public string? TaxNumber { get; init; }
    
    /// <summary>Vergi dairesi</summary>
    public string? TaxOffice { get; init; }
    
    /// <summary>Telefon</summary>
    public string? Phone { get; init; }
    
    /// <summary>E-posta</summary>
    public string? Email { get; init; }
    
    /// <summary>Adres</summary>
    public string? Address { get; init; }
    
    /// <summary>Şehir</summary>
    public string? City { get; init; }
    
    /// <summary>Ülke</summary>
    public string? Country { get; init; }
    
    /// <summary>Temel para birimi</summary>
    public string? BaseCurrency { get; init; }
    
    /// <summary>Varsayılan dil</summary>
    public string? DefaultLanguage { get; init; }
    
    /// <summary>Zaman dilimi</summary>
    public string? TimeZone { get; init; }
    
    /// <summary>Logo URL</summary>
    public string? LogoUrl { get; init; }
    
    /// <summary>Birincil renk</summary>
    public string? PrimaryColor { get; init; }
    
    /// <summary>Maksimum kullanıcı sayısı (Owner only)</summary>
    public int? MaxUsers { get; init; }
}

