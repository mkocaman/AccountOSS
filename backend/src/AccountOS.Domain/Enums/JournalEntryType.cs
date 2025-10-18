namespace AccountOS.Domain.Enums;

/// <summary>
/// Yevmiye kaydı tipi
/// </summary>
public enum JournalEntryType
{
    /// <summary>Standart kayıt</summary>
    Standard = 0,
    
    /// <summary>Açılış kaydı</summary>
    Opening = 1,
    
    /// <summary>Kapanış kaydı</summary>
    Closing = 2,
    
    /// <summary>Düzeltme kaydı</summary>
    Adjustment = 3,
    
    /// <summary>Ters kayıt</summary>
    Reversal = 4,
    
    /// <summary>Tahakkuk</summary>
    Accrual = 5
}

