namespace AccountOS.Domain.Enums;

/// <summary>
/// Fatura durumları
/// </summary>
public enum InvoiceStatus
{
    /// <summary>Taslak</summary>
    Draft = 0,
    
    /// <summary>Kesildi</summary>
    Issued = 1,
    
    /// <summary>Kısmi Ödendi</summary>
    PartiallyPaid = 2,
    
    /// <summary>Ödendi</summary>
    Paid = 3,
    
    /// <summary>Vadesi Geçti</summary>
    Overdue = 4,
    
    /// <summary>İptal</summary>
    Cancelled = 5
}
