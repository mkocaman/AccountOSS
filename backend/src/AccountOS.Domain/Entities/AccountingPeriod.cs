using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Muhasebe dönemi
/// </summary>
public class AccountingPeriod : TenantEntity
{
    /// <summary>Dönem adı (örn: 2025-01, Q1-2025)</summary>
    public string PeriodName { get; set; } = string.Empty;
    
    /// <summary>Dönem kodu (YYYY-MM)</summary>
    public string PeriodCode { get; set; } = string.Empty;
    
    /// <summary>Başlangıç tarihi</summary>
    public DateTime StartDate { get; set; }
    
    /// <summary>Bitiş tarihi</summary>
    public DateTime EndDate { get; set; }
    
    /// <summary>Mali yıl</summary>
    public int FiscalYear { get; set; }
    
    /// <summary>Dönem tipi</summary>
    public PeriodType PeriodType { get; set; }
    
    /// <summary>Durum</summary>
    public PeriodStatus Status { get; set; }
    
    /// <summary>Kapanış tarihi</summary>
    public DateTime? ClosedAt { get; set; }
    
    /// <summary>Kapatan kullanıcı ID</summary>
    public Guid? ClosedBy { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
}

