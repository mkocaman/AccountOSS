namespace AccountOS.Domain.Enums;

/// <summary>
/// Yevmiye kaydı durumu
/// </summary>
public enum JournalEntryStatus
{
    /// <summary>Taslak</summary>
    Draft = 0,
    
    /// <summary>Onay bekliyor</summary>
    PendingApproval = 1,
    
    /// <summary>Onaylandı</summary>
    Approved = 2,
    
    /// <summary>Deftere işlendi</summary>
    Posted = 3,
    
    /// <summary>İptal edildi</summary>
    Cancelled = 4
}

