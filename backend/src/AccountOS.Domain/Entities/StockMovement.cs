using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Stok hareketi entity (Audit trail için)
/// Tüm stok giriş/çıkışlarının kaydını tutar
/// </summary>
public class StockMovement : TenantEntity
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; set; }
    
    /// <summary>Hareket tarihi</summary>
    public DateTime MovementDate { get; set; }
    
    /// <summary>Hareket tipi</summary>
    public StockMovementType Type { get; set; }
    
    /// <summary>Referans tipi (Invoice, Transfer, Adjustment)</summary>
    public string ReferenceType { get; set; } = string.Empty;
    
    /// <summary>Referans ID</summary>
    public Guid ReferenceId { get; set; }
    
    /// <summary>Miktar (+) giriş, (-) çıkış</summary>
    public decimal Quantity { get; set; }
    
    /// <summary>Birim maliyet (baz para birimi)</summary>
    public decimal UnitCost { get; set; }
    
    /// <summary>Toplam maliyet (Quantity × UnitCost)</summary>
    public decimal TotalCost { get; set; }
    
    /// <summary>Hareket sonrası stok bakiyesi</summary>
    public decimal BalanceAfter { get; set; }
    
    /// <summary>Açıklama/Not</summary>
    public string? Description { get; set; }
    
    // Navigation Property
    /// <summary>İlgili ürün</summary>
    public Product Product { get; set; } = null!;
}

