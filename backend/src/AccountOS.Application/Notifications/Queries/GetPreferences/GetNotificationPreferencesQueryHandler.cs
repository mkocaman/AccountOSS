using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Notifications.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Queries.GetPreferences;

public class GetNotificationPreferencesQueryHandler 
    : IRequestHandler<GetNotificationPreferencesQuery, Result<List<NotificationPreferenceDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationPreferencesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<NotificationPreferenceDto>>> Handle(
        GetNotificationPreferencesQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<List<NotificationPreferenceDto>>.Fail("Kullanıcı bilgisi bulunamadı");

        var preferences = await _context.NotificationPreferences
            .Where(p => p.UserId == _currentUser.UserId.Value)
            .Select(p => new NotificationPreferenceDto
            {
                Id = p.Id,
                UserId = p.UserId,
                NotificationType = p.NotificationType,
                NotificationTypeName = GetTypeName(p.NotificationType),
                InAppEnabled = p.InAppEnabled,
                EmailEnabled = p.EmailEnabled,
                SmsEnabled = p.SmsEnabled,
                PushEnabled = p.PushEnabled,
                MinimumPriority = p.MinimumPriority,
                MinimumPriorityName = GetPriorityName(p.MinimumPriority),
                QuietHoursStart = p.QuietHoursStart,
                QuietHoursEnd = p.QuietHoursEnd
            })
            .ToListAsync(cancellationToken);

        return Result<List<NotificationPreferenceDto>>.Ok(preferences);
    }

    private static string GetTypeName(NotificationType type)
    {
        return type switch
        {
            NotificationType.System => "Sistem",
            NotificationType.Info => "Bilgi",
            NotificationType.Warning => "Uyarı",
            NotificationType.Error => "Hata",
            NotificationType.Success => "Başarı",
            NotificationType.Invoice => "Fatura",
            NotificationType.Payment => "Ödeme",
            NotificationType.Expense => "Gider",
            NotificationType.Stock => "Stok",
            NotificationType.Customer => "Müşteri",
            NotificationType.LowStock => "Düşük Stok",
            NotificationType.OverdueInvoice => "Vadesi Geçmiş Fatura",
            NotificationType.BudgetOverrun => "Bütçe Aşımı",
            NotificationType.PaymentReminder => "Ödeme Hatırlatması",
            NotificationType.PendingApproval => "Onay Bekleyen",
            NotificationType.Approved => "Onaylandı",
            NotificationType.Rejected => "Reddedildi",
            _ => type.ToString()
        };
    }

    private static string GetPriorityName(NotificationPriority priority)
    {
        return priority switch
        {
            NotificationPriority.Low => "Düşük",
            NotificationPriority.Medium => "Normal",
            NotificationPriority.High => "Yüksek",
            NotificationPriority.Critical => "Kritik",
            _ => priority.ToString()
        };
    }
}

