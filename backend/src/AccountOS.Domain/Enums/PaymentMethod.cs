namespace AccountOS.Domain.Enums;

/// <summary>
/// Ödeme yöntemi
/// </summary>
public enum PaymentMethod
{
    /// <summary>Nakit</summary>
    Cash = 0,
    
    /// <summary>Banka Havalesi</summary>
    BankTransfer = 1,
    
    /// <summary>Kredi Kartı</summary>
    CreditCard = 2,
    
    /// <summary>Çek</summary>
    Check = 3,
    
    /// <summary>Senet</summary>
    PromissoryNote = 4
}

