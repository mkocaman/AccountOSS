using AccountOS.Domain.Enums;

namespace AccountOS.Application.Preferences.Common;

public record UserPreferenceDto
{
    // UI Preferences
    public string Theme { get; init; } = "light";
    public string Language { get; init; } = "tr-TR";
    public string Timezone { get; init; } = "Europe/Istanbul";
    public string DateFormat { get; init; } = "dd/MM/yyyy";
    public string TimeFormat { get; init; } = "24";
    public string NumberFormat { get; init; } = "tr-TR";
    public string DefaultCurrency { get; init; } = "TRY";
    
    // Dashboard Preferences
    public string? DashboardLayout { get; init; }
    public string? DefaultPage { get; init; }
    public int ItemsPerPage { get; init; } = 25;
    public bool CompactMode { get; init; }
    public bool SidebarCollapsed { get; init; }
    
    // Email Preferences
    public bool EmailNotificationsEnabled { get; init; } = true;
    public bool DailyDigestEmail { get; init; }
    public bool WeeklyReportEmail { get; init; }
    
    // Default Values
    public int? DefaultInvoiceDueDays { get; init; } = 30;
    public PaymentMethod? DefaultPaymentMethod { get; init; }
    public decimal? DefaultVatRate { get; init; } = 20;
    public string? InvoiceNotesTemplate { get; init; }
    
    // Privacy Settings
    public string ProfileVisibility { get; init; } = "company";
    public bool ShowLastActivity { get; init; } = true;
    public bool ShowEmail { get; init; }
    
    // Advanced
    public string? KeyboardShortcuts { get; init; }
    public string? CustomCss { get; init; }
    public string? AdditionalSettings { get; init; }
}

