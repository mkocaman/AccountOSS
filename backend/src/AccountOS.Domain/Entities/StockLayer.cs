using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Stok katmanı entity (FIFO için)
/// Her alış işlemi yeni bir katman oluşturur
/// </summary>
public class StockLayer : TenantEntity
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; set; }
    
    /// <summary>Giriş tarihi</summary>
    public DateTime EntryDate { get; set; }
    
    /// <summary>Referans tipi (Invoice, Transfer, Adjustment)</summary>
    public string ReferenceType { get; set; } = string.Empty;
    
    /// <summary>Referans ID (Invoice ID, vb.)</summary>
    public Guid ReferenceId { get; set; }
    
    /// <summary>Giriş miktarı</summary>
    public decimal EntryQuantity { get; set; }
    
    /// <summary>Kalan miktar (FIFO için - satış/çıkışlar bu miktarı azaltır)</summary>
    public decimal RemainingQuantity { get; set; }
    
    /// <summary>Birim maliyet (orijinal para birimi)</summary>
    public decimal UnitCost { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = string.Empty;
    
    /// <summary>Baz para biriminde birim maliyet (snapshot - FIFO hesabı için)</summary>
    public decimal UnitCostInBase { get; set; }
    
    /// <summary>Baz para birimi kodu</summary>
    public string BaseCurrency { get; set; } = string.Empty;
    
    /// <summary>Kullanılan kur (snapshot - değişmemeli)</summary>
    public decimal ExchangeRate { get; set; }
    
    // Navigation Properties
    /// <summary>İlgili ürün</summary>
    public Product Product { get; set; } = null!;
    
    /// <summary>Bu katmandan yapılan tüketimler</summary>
    public ICollection<StockConsumption> Consumptions { get; set; } = new List<StockConsumption>();
}

