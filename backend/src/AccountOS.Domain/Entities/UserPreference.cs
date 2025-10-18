using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Kullanıcı tercihleri
/// </summary>
public class UserPreference : BaseEntity
{
    /// <summary>Kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; set; }
    
    // UI Preferences
    
    /// <summary>Tema (light, dark, auto)</summary>
    public string Theme { get; set; } = "light";
    
    /// <summary>Dil kodu (tr-TR, en-US, etc.)</summary>
    public string Language { get; set; } = "tr-TR";
    
    /// <summary>Zaman dilimi</summary>
    public string Timezone { get; set; } = "Europe/Istanbul";
    
    /// <summary>Tarih formatı (dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd)</summary>
    public string DateFormat { get; set; } = "dd/MM/yyyy";
    
    /// <summary>Saat formatı (24, 12)</summary>
    public string TimeFormat { get; set; } = "24";
    
    /// <summary>Sayı formatı (1,234.56 vs 1.234,56)</summary>
    public string NumberFormat { get; set; } = "tr-TR";
    
    /// <summary>Varsayılan para birimi</summary>
    public string DefaultCurrency { get; set; } = "TRY";
    
    // Dashboard Preferences
    
    /// <summary>Dashboard layout (JSON - widget positions)</summary>
    public string? DashboardLayout { get; set; }
    
    /// <summary>Varsayılan sayfa (dashboard, invoices, etc.)</summary>
    public string? DefaultPage { get; set; }
    
    /// <summary>Sayfa başına kayıt sayısı</summary>
    public int ItemsPerPage { get; set; } = 25;
    
    /// <summary>Compact mode aktif mi?</summary>
    public bool CompactMode { get; set; }
    
    /// <summary>Sidebar daraltılmış mı?</summary>
    public bool SidebarCollapsed { get; set; }
    
    // Email Preferences
    
    /// <summary>Email bildirimleri aktif mi?</summary>
    public bool EmailNotificationsEnabled { get; set; } = true;
    
    /// <summary>Günlük özet email</summary>
    public bool DailyDigestEmail { get; set; }
    
    /// <summary>Haftalık rapor email</summary>
    public bool WeeklyReportEmail { get; set; }
    
    // Default Values
    
    /// <summary>Varsayılan fatura vade süresi (gün)</summary>
    public int? DefaultInvoiceDueDays { get; set; } = 30;
    
    /// <summary>Varsayılan ödeme yöntemi</summary>
    public PaymentMethod? DefaultPaymentMethod { get; set; }
    
    /// <summary>Varsayılan KDV oranı</summary>
    public decimal? DefaultVatRate { get; set; } = 20;
    
    /// <summary>Fatura notları şablonu</summary>
    public string? InvoiceNotesTemplate { get; set; }
    
    // Privacy Settings
    
    /// <summary>Profil görünürlüğü (public, private, company)</summary>
    public string ProfileVisibility { get; set; } = "company";
    
    /// <summary>Son aktivite göster</summary>
    public bool ShowLastActivity { get; set; } = true;
    
    /// <summary>Email adresini göster</summary>
    public bool ShowEmail { get; set; }
    
    // Advanced Preferences
    
    /// <summary>Klavye kısayolları (JSON)</summary>
    public string? KeyboardShortcuts { get; set; }
    
    /// <summary>Özel CSS (kullanıcı tema özelleştirme)</summary>
    public string? CustomCss { get; set; }
    
    /// <summary>Diğer tercihler (JSON - extensible)</summary>
    public string? AdditionalSettings { get; set; }
    
    // Navigation Properties
    public User User { get; set; } = null!;
    public Company Company { get; set; } = null!;
}

