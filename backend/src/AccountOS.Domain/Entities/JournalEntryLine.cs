using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Yevmiye kaydı satırı
/// </summary>
public class JournalEntryLine : BaseEntity
{
    /// <summary>Yevmiye kaydı ID</summary>
    public Guid JournalEntryId { get; set; }
    
    /// <summary>Hesap ID</summary>
    public Guid AccountId { get; set; }
    
    /// <summary>Satır numarası</summary>
    public int LineNumber { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Borç tutarı</summary>
    public decimal DebitAmount { get; set; }
    
    /// <summary>Alacak tutarı</summary>
    public decimal CreditAmount { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Döviz kuru (varsa)</summary>
    public decimal? ExchangeRate { get; set; }
    
    /// <summary>Ana para biriminde tutar</summary>
    public decimal? BaseCurrencyAmount { get; set; }
    
    // Navigation Properties
    public JournalEntry JournalEntry { get; set; } = null!;
    public ChartOfAccount Account { get; set; } = null!;
}

