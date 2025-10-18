using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Commands.UpdateUserPreference;

public class UpdateUserPreferenceCommandHandler 
    : IRequestHandler<UpdateUserPreferenceCommand, Result<UserPreferenceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateUserPreferenceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<UserPreferenceDto>> Handle(
        UpdateUserPreferenceCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<UserPreferenceDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Get or create preference
        var preference = await _context.UserPreferences
            .Where(p => p.UserId == userId)
            .FirstOrDefaultAsync(cancellationToken);

        if (preference == null)
        {
            // Create new preference with company defaults
            var companySettings = await _context.CompanySettings
                .Where(s => s.CompanyId == companyId)
                .FirstOrDefaultAsync(cancellationToken);

            preference = new UserPreference
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CompanyId = companyId,
                Theme = "light",
                Language = companySettings?.DefaultLanguage ?? "tr-TR",
                Timezone = companySettings?.DefaultTimezone ?? "Europe/Istanbul",
                DateFormat = "dd/MM/yyyy",
                TimeFormat = "24",
                NumberFormat = "tr-TR",
                DefaultCurrency = companySettings?.DefaultCurrency ?? "TRY",
                ItemsPerPage = 25,
                EmailNotificationsEnabled = true,
                ProfileVisibility = "company",
                ShowLastActivity = true,
                DefaultInvoiceDueDays = companySettings?.DefaultInvoiceDueDays ?? 30,
                DefaultVatRate = companySettings?.DefaultVatRate ?? 20,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.UserPreferences.Add(preference);
        }

        // Update only provided fields
        if (request.Theme != null) preference.Theme = request.Theme;
        if (request.Language != null) preference.Language = request.Language;
        if (request.Timezone != null) preference.Timezone = request.Timezone;
        if (request.DateFormat != null) preference.DateFormat = request.DateFormat;
        if (request.TimeFormat != null) preference.TimeFormat = request.TimeFormat;
        if (request.NumberFormat != null) preference.NumberFormat = request.NumberFormat;
        if (request.DefaultCurrency != null) preference.DefaultCurrency = request.DefaultCurrency;
        
        if (request.DashboardLayout != null) preference.DashboardLayout = request.DashboardLayout;
        if (request.DefaultPage != null) preference.DefaultPage = request.DefaultPage;
        if (request.ItemsPerPage.HasValue) preference.ItemsPerPage = request.ItemsPerPage.Value;
        if (request.CompactMode.HasValue) preference.CompactMode = request.CompactMode.Value;
        if (request.SidebarCollapsed.HasValue) preference.SidebarCollapsed = request.SidebarCollapsed.Value;
        
        if (request.EmailNotificationsEnabled.HasValue) preference.EmailNotificationsEnabled = request.EmailNotificationsEnabled.Value;
        if (request.DailyDigestEmail.HasValue) preference.DailyDigestEmail = request.DailyDigestEmail.Value;
        if (request.WeeklyReportEmail.HasValue) preference.WeeklyReportEmail = request.WeeklyReportEmail.Value;
        
        if (request.DefaultInvoiceDueDays.HasValue) preference.DefaultInvoiceDueDays = request.DefaultInvoiceDueDays.Value;
        if (request.DefaultPaymentMethod.HasValue) preference.DefaultPaymentMethod = request.DefaultPaymentMethod.Value;
        if (request.DefaultVatRate.HasValue) preference.DefaultVatRate = request.DefaultVatRate.Value;
        if (request.InvoiceNotesTemplate != null) preference.InvoiceNotesTemplate = request.InvoiceNotesTemplate;
        
        if (request.ProfileVisibility != null) preference.ProfileVisibility = request.ProfileVisibility;
        if (request.ShowLastActivity.HasValue) preference.ShowLastActivity = request.ShowLastActivity.Value;
        if (request.ShowEmail.HasValue) preference.ShowEmail = request.ShowEmail.Value;
        
        if (request.KeyboardShortcuts != null) preference.KeyboardShortcuts = request.KeyboardShortcuts;
        if (request.CustomCss != null) preference.CustomCss = request.CustomCss;
        if (request.AdditionalSettings != null) preference.AdditionalSettings = request.AdditionalSettings;

        preference.UpdatedAt = DateTime.UtcNow;
        preference.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(preference);
        return Result<UserPreferenceDto>.Ok(dto);
    }

    private static UserPreferenceDto MapToDto(UserPreference preference)
    {
        return new UserPreferenceDto
        {
            Theme = preference.Theme,
            Language = preference.Language,
            Timezone = preference.Timezone,
            DateFormat = preference.DateFormat,
            TimeFormat = preference.TimeFormat,
            NumberFormat = preference.NumberFormat,
            DefaultCurrency = preference.DefaultCurrency,
            DashboardLayout = preference.DashboardLayout,
            DefaultPage = preference.DefaultPage,
            ItemsPerPage = preference.ItemsPerPage,
            CompactMode = preference.CompactMode,
            SidebarCollapsed = preference.SidebarCollapsed,
            EmailNotificationsEnabled = preference.EmailNotificationsEnabled,
            DailyDigestEmail = preference.DailyDigestEmail,
            WeeklyReportEmail = preference.WeeklyReportEmail,
            DefaultInvoiceDueDays = preference.DefaultInvoiceDueDays,
            DefaultPaymentMethod = preference.DefaultPaymentMethod,
            DefaultVatRate = preference.DefaultVatRate,
            InvoiceNotesTemplate = preference.InvoiceNotesTemplate,
            ProfileVisibility = preference.ProfileVisibility,
            ShowLastActivity = preference.ShowLastActivity,
            ShowEmail = preference.ShowEmail,
            KeyboardShortcuts = preference.KeyboardShortcuts,
            CustomCss = preference.CustomCss,
            AdditionalSettings = preference.AdditionalSettings
        };
    }
}

