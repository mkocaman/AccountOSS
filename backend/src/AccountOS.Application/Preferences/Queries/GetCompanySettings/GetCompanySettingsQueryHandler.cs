using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Queries.GetCompanySettings;

public class GetCompanySettingsQueryHandler 
    : IRequestHandler<GetCompanySettingsQuery, Result<CompanySettingsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCompanySettingsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CompanySettingsDto>> Handle(
        GetCompanySettingsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<CompanySettingsDto>.Fail("Şirket bilgisi bulunamadı");

        var settings = await _context.CompanySettings
            .Where(s => s.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
            return Result<CompanySettingsDto>.Fail("Şirket ayarları bulunamadı");

        var dto = new CompanySettingsDto
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

        return Result<CompanySettingsDto>.Ok(dto);
    }
}

