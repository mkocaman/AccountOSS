namespace AccountOS.Domain.Enums;

/// <summary>
/// Audit log aksiyonları
/// </summary>
public enum AuditAction
{
    /// <summary>Yeni kayıt oluşturuldu</summary>
    Create = 0,
    
    /// <summary>Kayıt güncellendi</summary>
    Update = 1,
    
    /// <summary>Kayıt silindi</summary>
    Delete = 2,
    
    /// <summary>Kayıt görüntülendi</summary>
    View = 3,
    
    /// <summary>Kayıt geri yüklendi (soft delete'ten)</summary>
    Restore = 4,
    
    /// <summary>Kullanıcı giriş yaptı</summary>
    Login = 10,
    
    /// <summary>Kullanıcı çıkış yaptı</summary>
    Logout = 11,
    
    /// <summary>Başarısız giriş denemesi</summary>
    LoginFailed = 12,
    
    /// <summary>Şifre değiştirildi</summary>
    PasswordChanged = 13,
    
    /// <summary>Şifre sıfırlandı</summary>
    PasswordReset = 14,
    
    /// <summary>Email gönderildi</summary>
    EmailSent = 20,
    
    /// <summary>PDF oluşturuldu</summary>
    PdfGenerated = 21,
    
    /// <summary>Rapor oluşturuldu</summary>
    ReportGenerated = 22,
    
    /// <summary>Dosya yüklendi</summary>
    FileUploaded = 23,
    
    /// <summary>Dosya indirildi</summary>
    FileDownloaded = 24,
    
    /// <summary>Toplu işlem yapıldı</summary>
    BulkOperation = 30,
    
    /// <summary>İçe aktarma yapıldı</summary>
    Import = 31,
    
    /// <summary>Dışa aktarma yapıldı</summary>
    Export = 32,
    
    /// <summary>Diğer özel aksiyonlar</summary>
    Custom = 99
}

