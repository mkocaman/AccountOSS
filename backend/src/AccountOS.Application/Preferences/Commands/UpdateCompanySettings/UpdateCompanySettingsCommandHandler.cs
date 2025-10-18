using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Commands.UpdateCompanySettings;

public class UpdateCompanySettingsCommandHandler 
    : IRequestHandler<UpdateCompanySettingsCommand, Result<CompanySettingsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCompanySettingsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanySettingsDto>> Handle(
        UpdateCompanySettingsCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<CompanySettingsDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId.Value;

        // Get or create company settings
        var settings = await _context.CompanySettings
            .Where(s => s.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            // Create default settings
            var company = await _context.Companies
                .Where(c => c.Id == companyId)
                .FirstOrDefaultAsync(cancellationToken);

            if (company == null)
                return Result<CompanySettingsDto>.Fail("Şirket bulunamadı");

            settings = new CompanySettings
            {
                Id = Guid.NewGuid(),
                CompanyId = companyId,
                CompanyName = company.Name,
                DefaultCurrency = "TRY",
                DefaultLanguage = "tr-TR",
                DefaultTimezone = "Europe/Istanbul",
                DefaultVatRate = 20,
                DefaultInvoiceDueDays = 30,
                DefaultPaymentMethod = Domain.Enums.PaymentMethod.BankTransfer,
                InvoicePrefix = "INV-",
                InvoiceStartNumber = 1,
                InvoiceNumberFormat = "{PREFIX}{YEAR}{NUMBER:0000}",
                BusinessHoursStart = "09:00",
                BusinessHoursEnd = "18:00",
                WeekendDays = "[0,6]",
                FiscalYearStartMonth = 1,
                MultiCurrencyEnabled = true,
                InventoryEnabled = true,
                ExpenseManagementEnabled = true,
                RequireEmailVerification = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.CompanySettings.Add(settings);
        }

        // Update only provided fields
        if (request.CompanyName != null) settings.CompanyName = request.CompanyName;
        if (request.LogoUrl != null) settings.LogoUrl = request.LogoUrl;
        if (request.Website != null) settings.Website = request.Website;
        if (request.Phone != null) settings.Phone = request.Phone;
        if (request.Email != null) settings.Email = request.Email;
        if (request.Address != null) settings.Address = request.Address;
        if (request.TaxNumber != null) settings.TaxNumber = request.TaxNumber;
        if (request.TaxOffice != null) settings.TaxOffice = request.TaxOffice;
        
        if (request.DefaultCurrency != null) settings.DefaultCurrency = request.DefaultCurrency;
        if (request.DefaultLanguage != null) settings.DefaultLanguage = request.DefaultLanguage;
        if (request.DefaultTimezone != null) settings.DefaultTimezone = request.DefaultTimezone;
        if (request.DefaultVatRate.HasValue) settings.DefaultVatRate = request.DefaultVatRate.Value;
        if (request.DefaultInvoiceDueDays.HasValue) settings.DefaultInvoiceDueDays = request.DefaultInvoiceDueDays.Value;
        if (request.DefaultPaymentMethod.HasValue) settings.DefaultPaymentMethod = request.DefaultPaymentMethod.Value;
        
        if (request.InvoicePrefix != null) settings.InvoicePrefix = request.InvoicePrefix;
        if (request.InvoiceStartNumber.HasValue) settings.InvoiceStartNumber = request.InvoiceStartNumber.Value;
        if (request.InvoiceNumberFormat != null) settings.InvoiceNumberFormat = request.InvoiceNumberFormat;
        if (request.InvoiceFooter != null) settings.InvoiceFooter = request.InvoiceFooter;
        if (request.DefaultInvoiceNotes != null) settings.DefaultInvoiceNotes = request.DefaultInvoiceNotes;
        if (request.DefaultInvoiceTerms != null) settings.DefaultInvoiceTerms = request.DefaultInvoiceTerms;
        
        if (request.EmailSenderName != null) settings.EmailSenderName = request.EmailSenderName;
        if (request.EmailSenderAddress != null) settings.EmailSenderAddress = request.EmailSenderAddress;
        if (request.EmailSignature != null) settings.EmailSignature = request.EmailSignature;
        
        if (request.BusinessHoursStart != null) settings.BusinessHoursStart = request.BusinessHoursStart;
        if (request.BusinessHoursEnd != null) settings.BusinessHoursEnd = request.BusinessHoursEnd;
        if (request.WeekendDays != null) settings.WeekendDays = request.WeekendDays;
        if (request.FiscalYearStartMonth.HasValue) settings.FiscalYearStartMonth = request.FiscalYearStartMonth.Value;
        
        if (request.MultiCurrencyEnabled.HasValue) settings.MultiCurrencyEnabled = request.MultiCurrencyEnabled.Value;
        if (request.InventoryEnabled.HasValue) settings.InventoryEnabled = request.InventoryEnabled.Value;
        if (request.ExpenseManagementEnabled.HasValue) settings.ExpenseManagementEnabled = request.ExpenseManagementEnabled.Value;
        if (request.RequireTwoFactor.HasValue) settings.RequireTwoFactor = request.RequireTwoFactor.Value;
        if (request.RequireEmailVerification.HasValue) settings.RequireEmailVerification = request.RequireEmailVerification.Value;
        
        if (request.CustomSettings != null) settings.CustomSettings = request.CustomSettings;

        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(settings);
        return Result<CompanySettingsDto>.Ok(dto);
    }

    private static CompanySettingsDto MapToDto(CompanySettings settings)
    {
        return new CompanySettingsDto
        {
            Id = settings.Id,
            CompanyId = settings.CompanyId,
            CompanyName = settings.CompanyName,
            LogoUrl = settings.LogoUrl,
            Website = settings.Website,
            Phone = settings.Phone,
            Email = settings.Email,
            Address = settings.Address,
            TaxNumber = settings.TaxNumber,
            TaxOffice = settings.TaxOffice,
            DefaultCurrency = settings.DefaultCurrency,
            DefaultLanguage = settings.DefaultLanguage,
            DefaultTimezone = settings.DefaultTimezone,
            DefaultVatRate = settings.DefaultVatRate,
            DefaultInvoiceDueDays = settings.DefaultInvoiceDueDays,
            DefaultPaymentMethod = settings.DefaultPaymentMethod,
            InvoicePrefix = settings.InvoicePrefix,
            InvoiceStartNumber = settings.InvoiceStartNumber,
            InvoiceNumberFormat = settings.InvoiceNumberFormat,
            InvoiceFooter = settings.InvoiceFooter,
            DefaultInvoiceNotes = settings.DefaultInvoiceNotes,
            DefaultInvoiceTerms = settings.DefaultInvoiceTerms,
            EmailSenderName = settings.EmailSenderName,
            EmailSenderAddress = settings.EmailSenderAddress,
            EmailSignature = settings.EmailSignature,
            BusinessHoursStart = settings.BusinessHoursStart,
            BusinessHoursEnd = settings.BusinessHoursEnd,
            WeekendDays = settings.WeekendDays,
            FiscalYearStartMonth = settings.FiscalYearStartMonth,
            MultiCurrencyEnabled = settings.MultiCurrencyEnabled,
            InventoryEnabled = settings.InventoryEnabled,
            ExpenseManagementEnabled = settings.ExpenseManagementEnabled,
            RequireTwoFactor = settings.RequireTwoFactor,
            RequireEmailVerification = settings.RequireEmailVerification,
            CustomSettings = settings.CustomSettings
        };
    }
}

