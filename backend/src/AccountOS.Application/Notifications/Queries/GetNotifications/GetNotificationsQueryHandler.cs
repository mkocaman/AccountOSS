using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Notifications.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Notifications.Queries.GetNotifications;

public class GetNotificationsQueryHandler 
    : IRequestHandler<GetNotificationsQuery, Result<List<NotificationDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetNotificationsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<NotificationDto>>> Handle(
        GetNotificationsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<List<NotificationDto>>.Fail("Kullanıcı bilgisi bulunamadı");

        var query = _context.Notifications
            .Where(n => n.UserId == _currentUser.UserId.Value);

        // Filters
        if (request.IsRead.HasValue)
            query = query.Where(n => n.IsRead == request.IsRead.Value);

        if (request.Type.HasValue)
            query = query.Where(n => n.Type == request.Type.Value);

        if (request.Priority.HasValue)
            query = query.Where(n => n.Priority == request.Priority.Value);

        // Expired notifications exclude
        query = query.Where(n => n.ExpiresAt == null || n.ExpiresAt > DateTime.UtcNow);

        // Pagination
        var skip = (request.PageNumber - 1) * request.PageSize;

        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                CompanyId = n.CompanyId,
                UserId = n.UserId,
                Type = n.Type,
                TypeName = GetTypeName(n.Type),
                Priority = n.Priority,
                PriorityName = GetPriorityName(n.Priority),
                Title = n.Title,
                Message = n.Message,
                EntityType = n.EntityType,
                EntityId = n.EntityId,
                EntityName = n.EntityName,
                ActionUrl = n.ActionUrl,
                Icon = n.Icon,
                Color = n.Color,
                IsRead = n.IsRead,
                ReadAt = n.ReadAt,
                EmailSent = n.EmailSent,
                EmailSentAt = n.EmailSentAt,
                CreatedAt = n.CreatedAt,
                TimeAgo = GetTimeAgo(n.CreatedAt)
            })
            .ToListAsync(cancellationToken);

        return Result<List<NotificationDto>>.Ok(notifications);
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

    private static string GetTimeAgo(DateTime dateTime)
    {
        var timeSpan = DateTime.UtcNow - dateTime;

        if (timeSpan.TotalMinutes < 1)
            return "Az önce";
        if (timeSpan.TotalMinutes < 60)
            return $"{(int)timeSpan.TotalMinutes} dakika önce";
        if (timeSpan.TotalHours < 24)
            return $"{(int)timeSpan.TotalHours} saat önce";
        if (timeSpan.TotalDays < 7)
            return $"{(int)timeSpan.TotalDays} gün önce";
        if (timeSpan.TotalDays < 30)
            return $"{(int)(timeSpan.TotalDays / 7)} hafta önce";
        if (timeSpan.TotalDays < 365)
            return $"{(int)(timeSpan.TotalDays / 30)} ay önce";
        
        return $"{(int)(timeSpan.TotalDays / 365)} yıl önce";
    }
}

