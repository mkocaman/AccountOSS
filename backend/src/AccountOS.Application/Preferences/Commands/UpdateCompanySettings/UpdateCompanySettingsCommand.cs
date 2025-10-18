using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Preferences.Commands.UpdateCompanySettings;

public record UpdateCompanySettingsCommand : IRequest<Result<CompanySettingsDto>>
{
    // Company Info
    public string? CompanyName { get; init; }
    public string? LogoUrl { get; init; }
    public string? Website { get; init; }
    public string? Phone { get; init; }
    public string? Email { get; init; }
    public string? Address { get; init; }
    public string? TaxNumber { get; init; }
    public string? TaxOffice { get; init; }
    
    // Default Settings
    public string? DefaultCurrency { get; init; }
    public string? DefaultLanguage { get; init; }
    public string? DefaultTimezone { get; init; }
    public decimal? DefaultVatRate { get; init; }
    public int? DefaultInvoiceDueDays { get; init; }
    public PaymentMethod? DefaultPaymentMethod { get; init; }
    
    // Invoice Settings
    public string? InvoicePrefix { get; init; }
    public int? InvoiceStartNumber { get; init; }
    public string? InvoiceNumberFormat { get; init; }
    public string? InvoiceFooter { get; init; }
    public string? DefaultInvoiceNotes { get; init; }
    public string? DefaultInvoiceTerms { get; init; }
    
    // Email Settings
    public string? EmailSenderName { get; init; }
    public string? EmailSenderAddress { get; init; }
    public string? EmailSignature { get; init; }
    
    // Business Settings
    public string? BusinessHoursStart { get; init; }
    public string? BusinessHoursEnd { get; init; }
    public string? WeekendDays { get; init; }
    public int? FiscalYearStartMonth { get; init; }
    
    // Feature Flags
    public bool? MultiCurrencyEnabled { get; init; }
    public bool? InventoryEnabled { get; init; }
    public bool? ExpenseManagementEnabled { get; init; }
    public bool? RequireTwoFactor { get; init; }
    public bool? RequireEmailVerification { get; init; }
    
    // Additional Settings
    public string? CustomSettings { get; init; }
}

