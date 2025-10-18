using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Şirket geneli ayarlar (admin tarafından yönetilir)
/// </summary>
public class CompanySettings : TenantEntity
{
    /// <summary>Şirket adı</summary>
    public string CompanyName { get; set; } = string.Empty;
    
    /// <summary>Şirket logosu URL</summary>
    public string? LogoUrl { get; set; }
    
    /// <summary>Şirket web sitesi</summary>
    public string? Website { get; set; }
    
    /// <summary>Şirket telefonu</summary>
    public string? Phone { get; set; }
    
    /// <summary>Şirket email</summary>
    public string? Email { get; set; }
    
    /// <summary>Şirket adresi</summary>
    public string? Address { get; set; }
    
    /// <summary>Vergi numarası</summary>
    public string? TaxNumber { get; set; }
    
    /// <summary>Vergi dairesi</summary>
    public string? TaxOffice { get; set; }
    
    // Default Settings (company-wide)
    
    /// <summary>Varsayılan para birimi</summary>
    public string DefaultCurrency { get; set; } = "TRY";
    
    /// <summary>Varsayılan dil</summary>
    public string DefaultLanguage { get; set; } = "tr-TR";
    
    /// <summary>Varsayılan zaman dilimi</summary>
    public string DefaultTimezone { get; set; } = "Europe/Istanbul";
    
    /// <summary>Varsayılan KDV oranı</summary>
    public decimal DefaultVatRate { get; set; } = 20;
    
    /// <summary>Varsayılan fatura vade süresi (gün)</summary>
    public int DefaultInvoiceDueDays { get; set; } = 30;
    
    /// <summary>Varsayılan ödeme yöntemi</summary>
    public PaymentMethod DefaultPaymentMethod { get; set; }
    
    // Invoice Settings
    
    /// <summary>Fatura öneki (INV-, FA-)</summary>
    public string? InvoicePrefix { get; set; } = "INV-";
    
    /// <summary>Fatura başlangıç numarası</summary>
    public int InvoiceStartNumber { get; set; } = 1;
    
    /// <summary>Fatura numarası formatı</summary>
    public string InvoiceNumberFormat { get; set; } = "{PREFIX}{YEAR}{NUMBER:0000}";
    
    /// <summary>Fatura footer metni</summary>
    public string? InvoiceFooter { get; set; }
    
    /// <summary>Fatura notları (varsayılan)</summary>
    public string? DefaultInvoiceNotes { get; set; }
    
    /// <summary>Fatura şartları (varsayılan)</summary>
    public string? DefaultInvoiceTerms { get; set; }
    
    // Email Settings
    
    /// <summary>Email gönderen adı</summary>
    public string? EmailSenderName { get; set; }
    
    /// <summary>Email gönderen adresi</summary>
    public string? EmailSenderAddress { get; set; }
    
    /// <summary>Email imzası</summary>
    public string? EmailSignature { get; set; }
    
    // Business Settings
    
    /// <summary>İş saatleri başlangıç (HH:mm)</summary>
    public string BusinessHoursStart { get; set; } = "09:00";
    
    /// <summary>İş saatleri bitiş (HH:mm)</summary>
    public string BusinessHoursEnd { get; set; } = "18:00";
    
    /// <summary>Hafta sonu günleri (JSON array - 0=Sunday, 6=Saturday)</summary>
    public string? WeekendDays { get; set; } = "[0,6]";
    
    /// <summary>Mali yıl başlangıç ayı (1-12)</summary>
    public int FiscalYearStartMonth { get; set; } = 1;
    
    // Feature Flags
    
    /// <summary>Multi-currency aktif mi?</summary>
    public bool MultiCurrencyEnabled { get; set; } = true;
    
    /// <summary>Stok takibi aktif mi?</summary>
    public bool InventoryEnabled { get; set; } = true;
    
    /// <summary>Gider yönetimi aktif mi?</summary>
    public bool ExpenseManagementEnabled { get; set; } = true;
    
    /// <summary>2FA zorunlu mu?</summary>
    public bool RequireTwoFactor { get; set; }
    
    /// <summary>Email doğrulama zorunlu mu?</summary>
    public bool RequireEmailVerification { get; set; } = true;
    
    // Additional Settings
    
    /// <summary>Özel ayarlar (JSON - extensible)</summary>
    public string? CustomSettings { get; set; }
}

