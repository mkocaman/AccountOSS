namespace AccountOS.Domain.Enums;

/// <summary>
/// Bildirim tipi
/// </summary>
public enum NotificationType
{
    /// <summary>Sistem bildirimi</summary>
    System = 0,
    
    /// <summary>Bilgilendirme</summary>
    Info = 1,
    
    /// <summary>Uyarı</summary>
    Warning = 2,
    
    /// <summary>Hata</summary>
    Error = 3,
    
    /// <summary>Başarı</summary>
    Success = 4,
    
    // Business notifications
    
    /// <summary>Fatura bildirimi</summary>
    Invoice = 10,
    
    /// <summary>Ödeme bildirimi</summary>
    Payment = 11,
    
    /// <summary>Gider bildirimi</summary>
    Expense = 12,
    
    /// <summary>Stok bildirimi</summary>
    Stock = 13,
    
    /// <summary>Müşteri bildirimi</summary>
    Customer = 14,
    
    // Alerts
    
    /// <summary>Düşük stok uyarısı</summary>
    LowStock = 20,
    
    /// <summary>Vadesi geçmiş fatura</summary>
    OverdueInvoice = 21,
    
    /// <summary>Bütçe aşımı</summary>
    BudgetOverrun = 22,
    
    /// <summary>Ödeme hatırlatması</summary>
    PaymentReminder = 23,
    
    /// <summary>Onay bekleyen</summary>
    PendingApproval = 24,
    
    /// <summary>Onaylandı</summary>
    Approved = 25,
    
    /// <summary>Reddedildi</summary>
    Rejected = 26,
    
    /// <summary>Özel bildirim</summary>
    Custom = 99
}

