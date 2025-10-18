using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Preferences.Commands.UpdateUserPreference;

public record UpdateUserPreferenceCommand : IRequest<Result<UserPreferenceDto>>
{
    // UI Preferences
    public string? Theme { get; init; }
    public string? Language { get; init; }
    public string? Timezone { get; init; }
    public string? DateFormat { get; init; }
    public string? TimeFormat { get; init; }
    public string? NumberFormat { get; init; }
    public string? DefaultCurrency { get; init; }
    
    // Dashboard Preferences
    public string? DashboardLayout { get; init; }
    public string? DefaultPage { get; init; }
    public int? ItemsPerPage { get; init; }
    public bool? CompactMode { get; init; }
    public bool? SidebarCollapsed { get; init; }
    
    // Email Preferences
    public bool? EmailNotificationsEnabled { get; init; }
    public bool? DailyDigestEmail { get; init; }
    public bool? WeeklyReportEmail { get; init; }
    
    // Default Values
    public int? DefaultInvoiceDueDays { get; init; }
    public PaymentMethod? DefaultPaymentMethod { get; init; }
    public decimal? DefaultVatRate { get; init; }
    public string? InvoiceNotesTemplate { get; init; }
    
    // Privacy Settings
    public string? ProfileVisibility { get; init; }
    public bool? ShowLastActivity { get; init; }
    public bool? ShowEmail { get; init; }
    
    // Advanced
    public string? KeyboardShortcuts { get; init; }
    public string? CustomCss { get; init; }
    public string? AdditionalSettings { get; init; }
}

