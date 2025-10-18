namespace AccountOS.Application.Currencies.Common;

/// <summary>
/// Para birimi DTO
/// </summary>
public record CurrencyDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Para birimi kodu (USD, EUR, TRY, vb.)</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Para birimi adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Sembol ($, €, ₺, vb.)</summary>
    public string Symbol { get; init; } = string.Empty;
    
    /// <summary>Ondalık basamak sayısı</summary>
    public int DecimalPlaces { get; init; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; init; }
}

