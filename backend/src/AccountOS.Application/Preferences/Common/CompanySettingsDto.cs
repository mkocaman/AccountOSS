using AccountOS.Domain.Enums;

namespace AccountOS.Application.Preferences.Common;

public record CompanySettingsDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    
    // Company Info
    public string CompanyName { get; init; } = string.Empty;
    public string? LogoUrl { get; init; }
    public string? Website { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Address { get; init; }
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    
    // Default Settings
    public string DefaultCurrency { get; init; } = "TRY";
    public string DefaultLanguage { get; init; } = "tr-TR";
    public string DefaultTimezone { get; init; } = "Europe/Istanbul";
    public decimal DefaultVatRate { get; init; } = 20;
    public int DefaultInvoiceDueDays { get; init; } = 30;
    public PaymentMethod DefaultPaymentMethod { get; init; }
    
    // Invoice Settings
    public string? InvoicePrefix { get; init; }
    public int InvoiceStartNumber { get; init; }
    public string InvoiceNumberFormat { get; init; } = string.Empty;
    public string? InvoiceFooter { get; init; }
    public string? DefaultInvoiceNotes { get; init; }
    public string? DefaultInvoiceTerms { get; init; }
    
    // Email Settings
    public string? EmailSenderName { get; init; }
    public string? EmailSenderAddress { get; init; }
    public string? EmailSignature { get; init; }
    
    // Business Settings
    public string BusinessHoursStart { get; init; } = "09:00";
    public string BusinessHoursEnd { get; init; } = "18:00";
    public string? WeekendDays { get; init; }
    public int FiscalYearStartMonth { get; init; } = 1;
    
    // Feature Flags
    public bool MultiCurrencyEnabled { get; init; }
    public bool InventoryEnabled { get; init; }
    public bool ExpenseManagementEnabled { get; init; }
    public bool RequireTwoFactor { get; init; }
    public bool RequireEmailVerification { get; init; }
    
    // Additional Settings
    public string? CustomSettings { get; init; }
}

