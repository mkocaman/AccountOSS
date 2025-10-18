namespace AccountOS.Domain.Enums;

/// <summary>
/// Email şablon tipleri
/// </summary>
public enum EmailTemplateType
{
    /// <summary>Fatura gönderimi</summary>
    InvoiceSent = 0,
    
    /// <summary>Ödeme alındı bildirimi</summary>
    PaymentReceived = 1,
    
    /// <summary>Ödeme hatırlatması</summary>
    PaymentReminder = 2,
    
    /// <summary>Cari hesap ekstresi</summary>
    CustomerStatement = 3,
    
    /// <summary>Hoş geldiniz email</summary>
    Welcome = 4,
    
    /// <summary>Vadesi yaklaşan fatura uyarısı</summary>
    InvoiceDueSoon = 5,
    
    /// <summary>Vadesi geçen fatura uyarısı</summary>
    InvoiceOverdue = 6,
    
    /// <summary>Düşük stok uyarısı</summary>
    LowStockAlert = 7,
    
    /// <summary>Genel bildirim</summary>
    General = 99
}

