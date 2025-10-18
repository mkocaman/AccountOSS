using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Döviz kuru entity
/// </summary>
public class FxRate : BaseEntity
{
    /// <summary>Baz para birimi kodu (örn: USD)</summary>
    public string BaseCurrencyCode { get; set; } = string.Empty;
    
    /// <summary>Hedef para birimi kodu (örn: TRY)</summary>
    public string QuoteCurrencyCode { get; set; } = string.Empty;
    
    /// <summary>Kur (örn: 1 USD = 32.50 TRY)</summary>
    public decimal Rate { get; set; }
    
    /// <summary>Geçerlilik tarihi</summary>
    public DateTime EffectiveDate { get; set; }
    
    /// <summary>Kaynak (TCMB, ECB, Manual, vb.)</summary>
    public string Source { get; set; } = "Manual";
    
    /// <summary>Manuel girildi mi?</summary>
    public bool IsManual { get; set; } = true;
    
    // Navigation properties
    /// <summary>Baz para birimi</summary>
    public Currency BaseCurrency { get; set; } = null!;
    
    /// <summary>Hedef para birimi</summary>
    public Currency QuoteCurrency { get; set; } = null!;
}

