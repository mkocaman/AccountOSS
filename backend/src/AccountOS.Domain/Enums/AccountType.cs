namespace AccountOS.Domain.Enums;

/// <summary>
/// Hesap tipi
/// </summary>
public enum AccountType
{
    /// <summary>Varlıklar (Assets)</summary>
    Asset = 0,
    
    /// <summary>Yükümlülükler (Liabilities)</summary>
    Liability = 1,
    
    /// <summary>Öz Sermaye (Equity)</summary>
    Equity = 2,
    
    /// <summary>Gelirler (Revenue)</summary>
    Revenue = 3,
    
    /// <summary>Giderler (Expenses)</summary>
    Expense = 4,
    
    /// <summary>Maliyet (Cost of Goods Sold)</summary>
    CostOfGoodsSold = 5
}

