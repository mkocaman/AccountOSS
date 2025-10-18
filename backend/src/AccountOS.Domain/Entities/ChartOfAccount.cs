using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Hesap planı
/// </summary>
public class ChartOfAccount : TenantEntity
{
    /// <summary>Hesap kodu (örn: 100, 120, 600)</summary>
    public string AccountCode { get; set; } = string.Empty;
    
    /// <summary>Hesap adı</summary>
    public string AccountName { get; set; } = string.Empty;
    
    /// <summary>Hesap tipi</summary>
    public AccountType AccountType { get; set; }
    
    /// <summary>Ana hesap ID (null = ana hesap)</summary>
    public Guid? ParentAccountId { get; set; }
    
    /// <summary>Seviye (0 = ana, 1 = alt, 2 = detay)</summary>
    public int Level { get; set; }
    
    /// <summary>Normal bakiye (Debit/Credit)</summary>
    public BalanceType NormalBalance { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Sistem hesabı mı? (manuel değiştirilemez)</summary>
    public bool IsSystemAccount { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    // Navigation Properties
    public ChartOfAccount? ParentAccount { get; set; }
    public ICollection<ChartOfAccount> SubAccounts { get; set; } = new List<ChartOfAccount>();
    public ICollection<JournalEntryLine> JournalEntries { get; set; } = new List<JournalEntryLine>();
}

