using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Stok tüketimi entity (FIFO consumption tracking)
/// Her satış/çıkış işlemi hangi katmanlardan ne kadar tükettiğini kaydeder
/// </summary>
public class StockConsumption : BaseEntity
{
    /// <summary>Stok katmanı ID</summary>
    public Guid StockLayerId { get; set; }
    
    /// <summary>Tüketim tarihi</summary>
    public DateTime ConsumptionDate { get; set; }
    
    /// <summary>Referans tipi (Invoice, Transfer)</summary>
    public string ReferenceType { get; set; } = string.Empty;
    
    /// <summary>Referans ID</summary>
    public Guid ReferenceId { get; set; }
    
    /// <summary>Tüketilen miktar</summary>
    public decimal Quantity { get; set; }
    
    /// <summary>Birim maliyet (katmandan gelen)</summary>
    public decimal UnitCost { get; set; }
    
    /// <summary>Toplam maliyet (Quantity × UnitCost)</summary>
    public decimal TotalCost { get; set; }
    
    // Navigation Property
    /// <summary>İlgili stok katmanı</summary>
    public StockLayer StockLayer { get; set; } = null!;
}

