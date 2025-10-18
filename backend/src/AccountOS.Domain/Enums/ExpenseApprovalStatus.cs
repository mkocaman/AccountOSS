namespace AccountOS.Domain.Enums;

/// <summary>
/// Gider onay durumu
/// </summary>
public enum ExpenseApprovalStatus
{
    /// <summary>Onay beklenmiyor</summary>
    NotRequired = 0,
    
    /// <summary>Onay bekliyor</summary>
    Pending = 1,
    
    /// <summary>Onaylandı</summary>
    Approved = 2,
    
    /// <summary>Reddedildi</summary>
    Rejected = 3
}

