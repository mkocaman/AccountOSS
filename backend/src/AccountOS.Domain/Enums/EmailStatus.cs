namespace AccountOS.Domain.Enums;

/// <summary>
/// Email gönderim durumu
/// </summary>
public enum EmailStatus
{
    /// <summary>Kuyrukta bekliyor</summary>
    Pending = 0,
    
    /// <summary>Gönderiliyor</summary>
    Sending = 1,
    
    /// <summary>Başarıyla gönderildi</summary>
    Sent = 2,
    
    /// <summary>Başarısız</summary>
    Failed = 3,
    
    /// <summary>Tekrar denenecek</summary>
    Retry = 4,
    
    /// <summary>Kalıcı hata (tekrar denenmeyecek)</summary>
    PermanentFailure = 5
}

