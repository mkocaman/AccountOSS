namespace AccountOS.Application.Currencies.Common;

/// <summary>
/// Döviz kuru DTO
/// </summary>
public record FxRateDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Baz para birimi</summary>
    public string BaseCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Hedef para birimi</summary>
    public string QuoteCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Kur</summary>
    public decimal Rate { get; init; }
    
    /// <summary>Geçerlilik tarihi</summary>
    public DateTime EffectiveDate { get; init; }
    
    /// <summary>Kaynak (TCMB, ECB, Manual)</summary>
    public string Source { get; init; } = string.Empty;
    
    /// <summary>Manuel girildi mi?</summary>
    public bool IsManual { get; init; }
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
    
    /// <summary>Oluşturan kullanıcı ID</summary>
    public Guid CreatedBy { get; init; }
}

