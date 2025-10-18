namespace AccountOS.Domain.Enums;

/// <summary>
/// Tekrarlama sıklığı
/// </summary>
public enum RecurringFrequency
{
    /// <summary>Günlük</summary>
    Daily = 0,
    
    /// <summary>Haftalık</summary>
    Weekly = 1,
    
    /// <summary>Aylık</summary>
    Monthly = 2,
    
    /// <summary>3 Aylık</summary>
    Quarterly = 3,
    
    /// <summary>6 Aylık</summary>
    SemiAnnually = 4,
    
    /// <summary>Yıllık</summary>
    Annually = 5
}

