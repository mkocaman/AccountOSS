namespace AccountOS.Domain.Enums;

/// <summary>
/// Gider durumu
/// </summary>
public enum ExpenseStatus
{
    /// <summary>Taslak</summary>
    Draft = 0,
    
    /// <summary>Beklemede (onay için)</summary>
    Pending = 1,
    
    /// <summary>Onaylandı</summary>
    Approved = 2,
    
    /// <summary>Ödendi</summary>
    Paid = 3,
    
    /// <summary>Reddedildi</summary>
    Rejected = 4,
    
    /// <summary>İptal edildi</summary>
    Cancelled = 5
}

