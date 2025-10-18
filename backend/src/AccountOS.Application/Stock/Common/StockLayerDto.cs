namespace AccountOS.Application.Stock.Common;

/// <summary>
/// Stok katmanı DTO
/// </summary>
public record StockLayerDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; init; }
    
    /// <summary>Ürün adı</summary>
    public string ProductName { get; init; } = string.Empty;
    
    /// <summary>Ürün kodu</summary>
    public string ProductCode { get; init; } = string.Empty;
    
    /// <summary>Giriş tarihi</summary>
    public DateTime EntryDate { get; init; }
    
    /// <summary>Referans tipi</summary>
    public string ReferenceType { get; init; } = string.Empty;
    
    /// <summary>Referans ID</summary>
    public Guid ReferenceId { get; init; }
    
    /// <summary>Giriş miktarı</summary>
    public decimal EntryQuantity { get; init; }
    
    /// <summary>Kalan miktar</summary>
    public decimal RemainingQuantity { get; init; }
    
    /// <summary>Tüketilen miktar</summary>
    public decimal ConsumedQuantity { get; init; }
    
    /// <summary>Birim maliyet</summary>
    public decimal UnitCost { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>Baz para biriminde birim maliyet</summary>
    public decimal UnitCostInBase { get; init; }
    
    /// <summary>Baz para birimi</summary>
    public string BaseCurrency { get; init; } = string.Empty;
    
    /// <summary>Kur</summary>
    public decimal ExchangeRate { get; init; }
    
    /// <summary>Durum</summary>
    public string Status { get; init; } = string.Empty;
}

