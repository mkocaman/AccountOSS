namespace AccountOS.Domain.Enums;

/// <summary>
/// Gider ödeme yöntemi
/// </summary>
public enum ExpensePaymentMethod
{
    /// <summary>Nakit</summary>
    Cash = 0,
    
    /// <summary>Banka havalesi</summary>
    BankTransfer = 1,
    
    /// <summary>Kredi kartı</summary>
    CreditCard = 2,
    
    /// <summary>Çek</summary>
    Check = 3,
    
    /// <summary>Senet</summary>
    PromissoryNote = 4,
    
    /// <summary>Diğer</summary>
    Other = 99
}

