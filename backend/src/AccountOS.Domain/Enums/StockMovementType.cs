namespace AccountOS.Domain.Enums;

/// <summary>
/// Stok hareket tipi
/// </summary>
public enum StockMovementType
{
    /// <summary>Alış (Purchase)</summary>
    Purchase = 0,
    
    /// <summary>Satış (Sales)</summary>
    Sales = 1,
    
    /// <summary>İade (Return)</summary>
    Return = 2,
    
    /// <summary>Transfer</summary>
    Transfer = 3,
    
    /// <summary>Sayım/Düzeltme (Adjustment)</summary>
    Adjustment = 4
}

