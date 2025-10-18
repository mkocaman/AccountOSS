using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Notifications.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Commands.SavePreference;

public class SaveNotificationPreferenceCommandHandler 
    : IRequestHandler<SaveNotificationPreferenceCommand, Result<NotificationPreferenceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SaveNotificationPreferenceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<NotificationPreferenceDto>> Handle(
        SaveNotificationPreferenceCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<NotificationPreferenceDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        var preference = await _context.NotificationPreferences
            .Where(p => p.UserId == userId && p.NotificationType == request.NotificationType)
            .FirstOrDefaultAsync(cancellationToken);

        if (preference == null)
        {
            // Create new
            preference = new NotificationPreference
            {
                Id = Guid.NewGuid(),
                CompanyId = companyId,
                UserId = userId,
                NotificationType = request.NotificationType,
                InAppEnabled = request.InAppEnabled,
                EmailEnabled = request.EmailEnabled,
                SmsEnabled = request.SmsEnabled,
                PushEnabled = request.PushEnabled,
                MinimumPriority = request.MinimumPriority,
                QuietHoursStart = request.QuietHoursStart,
                QuietHoursEnd = request.QuietHoursEnd,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.NotificationPreferences.Add(preference);
        }
        else
        {
            // Update existing
            preference.InAppEnabled = request.InAppEnabled;
            preference.EmailEnabled = request.EmailEnabled;
            preference.SmsEnabled = request.SmsEnabled;
            preference.PushEnabled = request.PushEnabled;
            preference.MinimumPriority = request.MinimumPriority;
            preference.QuietHoursStart = request.QuietHoursStart;
            preference.QuietHoursEnd = request.QuietHoursEnd;
            preference.UpdatedAt = DateTime.UtcNow;
            preference.UpdatedBy = userId;
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new NotificationPreferenceDto
        {
            Id = preference.Id,
            UserId = preference.UserId,
            NotificationType = preference.NotificationType,
            NotificationTypeName = GetTypeName(preference.NotificationType),
            InAppEnabled = preference.InAppEnabled,
            EmailEnabled = preference.EmailEnabled,
            SmsEnabled = preference.SmsEnabled,
            PushEnabled = preference.PushEnabled,
            MinimumPriority = preference.MinimumPriority,
            MinimumPriorityName = GetPriorityName(preference.MinimumPriority),
            QuietHoursStart = preference.QuietHoursStart,
            QuietHoursEnd = preference.QuietHoursEnd
        };

        return Result<NotificationPreferenceDto>.Ok(dto);
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

