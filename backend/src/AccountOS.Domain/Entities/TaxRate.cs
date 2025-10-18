using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Vergi oranı tanımları
/// </summary>
public class TaxRate : TenantEntity
{
    /// <summary>Vergi tipi</summary>
    public TaxType TaxType { get; set; }
    
    /// <summary>Vergi adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Vergi kodu (örn: KDV18, KDV8)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Vergi oranı (%)</summary>
    public decimal Rate { get; set; }
    
    /// <summary>Geçerlilik başlangıç tarihi</summary>
    public DateTime EffectiveFrom { get; set; }
    
    /// <summary>Geçerlilik bitiş tarihi (null = sınırsız)</summary>
    public DateTime? EffectiveTo { get; set; }
    
    /// <summary>Ülke kodu (ISO 3166)</summary>
    public string CountryCode { get; set; } = "TR";
    
    /// <summary>Varsayılan mı?</summary>
    public bool IsDefault { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
}

