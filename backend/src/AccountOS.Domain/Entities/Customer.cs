using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Cari hesap (Müşteri/Tedarikçi) entity
/// </summary>
public class Customer : TenantEntity
{
    /// <summary>Cari hesap kodu (otomatik: C-0001)</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Cari hesap adı/unvanı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Cari hesap tipi (Bireysel/Kurumsal)</summary>
    public CustomerType Type { get; set; }
    
    // İletişim Bilgileri
    /// <summary>E-posta adresi</summary>
    public string? Email { get; set; }
    
    /// <summary>Telefon</summary>
    public string? Phone { get; set; }
    
    /// <summary>Cep telefonu</summary>
    public string? MobilePhone { get; set; }
    
    /// <summary>Web sitesi</summary>
    public string? Website { get; set; }
    
    // Vergi Bilgileri
    /// <summary>Vergi numarası (kurumsal için)</summary>
    public string? TaxNumber { get; set; }
    
    /// <summary>Vergi dairesi</summary>
    public string? TaxOffice { get; set; }
    
    /// <summary>TC Kimlik No (bireysel için)</summary>
    public string? IdentityNumber { get; set; }
    
    // Adres Bilgileri
    /// <summary>Fatura adresi</summary>
    public string? BillingAddress { get; set; }
    
    /// <summary>Sevkiyat adresi</summary>
    public string? ShippingAddress { get; set; }
    
    /// <summary>Şehir</summary>
    public string? City { get; set; }
    
    /// <summary>Ülke</summary>
    public string? Country { get; set; }
    
    /// <summary>Posta kodu</summary>
    public string? PostalCode { get; set; }
    
    // Finansal Bilgiler
    /// <summary>Varsayılan para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Kredi limiti</summary>
    public decimal CreditLimit { get; set; }
    
    /// <summary>Vade gün sayısı (örn: 30 gün)</summary>
    public int PaymentTermDays { get; set; }
    
    /// <summary>Güncel bakiye (Alacak: pozitif, Borç: negatif)</summary>
    public decimal CurrentBalance { get; set; }
    
    // Durum
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Bloke edilmiş mi?</summary>
    public bool IsBlocked { get; set; }
    
    /// <summary>Bloke nedeni</summary>
    public string? BlockReason { get; set; }
    
    // Notlar
    /// <summary>Genel notlar</summary>
    public string? Notes { get; set; }
}

