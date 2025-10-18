using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Queries.GetUserPreference;

public class GetUserPreferenceQueryHandler 
    : IRequestHandler<GetUserPreferenceQuery, Result<UserPreferenceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUserPreferenceQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<UserPreferenceDto>> Handle(
        GetUserPreferenceQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<UserPreferenceDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var preference = await _context.UserPreferences
            .Where(p => p.UserId == _currentUser.UserId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (preference == null)
        {
            // Return default preferences
            var defaultPreference = new UserPreferenceDto
            {
                Theme = "light",
                Language = "tr-TR",
                Timezone = "Europe/Istanbul",
                DateFormat = "dd/MM/yyyy",
                TimeFormat = "24",
                NumberFormat = "tr-TR",
                DefaultCurrency = "TRY",
                ItemsPerPage = 25,
                EmailNotificationsEnabled = true,
                DefaultInvoiceDueDays = 30,
                DefaultVatRate = 20,
                ProfileVisibility = "company",
                ShowLastActivity = true
            };

            return Result<UserPreferenceDto>.Ok(defaultPreference);
        }

        var dto = new UserPreferenceDto
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

        return Result<UserPreferenceDto>.Ok(dto);
    }
}

