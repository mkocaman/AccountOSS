using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Şirket entity'si
/// Multi-tenant sistemin temel entity'si
/// Her kullanıcı bir veya birden fazla şirkete erişebilir
/// </summary>
public class Company : BaseEntity
{
    /// <summary>
    /// Şirket unvanı
    /// </summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>
    /// Vergi numarası (TC için 10 haneli, diğer ülkeler için farklı)
    /// </summary>
    public string? TaxNumber { get; set; }
    
    /// <summary>
    /// Vergi dairesi
    /// </summary>
    public string? TaxOffice { get; set; }
    
    /// <summary>
    /// Email adresi
    /// </summary>
    public string? Email { get; set; }
    
    /// <summary>
    /// Telefon numarası
    /// </summary>
    public string? Phone { get; set; }
    
    /// <summary>
    /// Adres
    /// </summary>
    public string? Address { get; set; }
    
    /// <summary>
    /// Şehir
    /// </summary>
    public string? City { get; set; }
    
    /// <summary>
    /// Ülke (ISO 3166-1 alpha-2: TR, UZ, RU, vb.)
    /// </summary>
    public string Country { get; set; } = "TR";
    
    /// <summary>
    /// Temel para birimi (ISO 4217: TRY, USD, EUR, UZS, vb.)
    /// </summary>
    public string BaseCurrency { get; set; } = "TRY";
    
    /// <summary>
    /// Zaman dilimi (IANA: Europe/Istanbul, Asia/Tashkent, vb.)
    /// </summary>
    public string TimeZone { get; set; } = "Europe/Istanbul";
    
    /// <summary>
    /// Varsayılan dil kodu (ISO 639-1: TR, EN, UZ, RU, vb. - büyük harf)
    /// </summary>
    public string DefaultLanguage { get; set; } = "TR";
    
    /// <summary>
    /// Şirket aktif mi?
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Logo URL/yolu
    /// </summary>
    public string? LogoUrl { get; set; }
    
    /// <summary>
    /// Birincil renk (white-label için, hex format: #FF5733)
    /// </summary>
    public string? PrimaryColor { get; set; }
    
    /// <summary>
    /// Abonelik bitiş tarihi
    /// </summary>
    public DateTime? SubscriptionExpiresAt { get; set; }
}
