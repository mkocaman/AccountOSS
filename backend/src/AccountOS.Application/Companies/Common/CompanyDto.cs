namespace AccountOS.Application.Companies.Common;

/// <summary>
/// Şirket bilgilerini taşıyan DTO
/// </summary>
public record CompanyDto
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
    
    /// <summary>Temel para birimi (USD, EUR, TRY, vb.)</summary>
    public string BaseCurrency { get; init; } = "TRY";
    
    /// <summary>Varsayılan dil (TR, EN, RU, vb.)</summary>
    public string DefaultLanguage { get; init; } = "TR";
    
    /// <summary>Zaman dilimi</summary>
    public string TimeZone { get; init; } = "Europe/Istanbul";
    
    /// <summary>Logo URL</summary>
    public string? LogoUrl { get; init; }
    
    /// <summary>Birincil renk (white-label için)</summary>
    public string? PrimaryColor { get; init; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
    
    /// <summary>Kullanıcının bu şirketteki rolü</summary>
    public string? UserRole { get; init; }
    
    /// <summary>Kullanıcının varsayılan şirketi mi?</summary>
    public bool IsDefaultForUser { get; init; }
}

