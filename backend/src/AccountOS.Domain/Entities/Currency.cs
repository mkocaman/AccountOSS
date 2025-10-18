using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Para birimi entity
/// </summary>
public class Currency : BaseEntity
{
    /// <summary>Para birimi kodu (ISO 4217 - örn: USD, EUR, TRY)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Para birimi adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Sembol (örn: $, €, ₺)</summary>
    public string Symbol { get; set; } = string.Empty;
    
    /// <summary>Ondalık basamak sayısı (çoğu para birimi için 2)</summary>
    public int DecimalPlaces { get; set; } = 2;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; set; }
    
    // Navigation properties
    /// <summary>Bu para birimiyle ilişkili kur kayıtları</summary>
    public ICollection<FxRate> FxRatesAsBase { get; set; } = new List<FxRate>();
    
    /// <summary>Bu para birimine dönüştürülen kur kayıtları</summary>
    public ICollection<FxRate> FxRatesAsQuote { get; set; } = new List<FxRate>();
}

