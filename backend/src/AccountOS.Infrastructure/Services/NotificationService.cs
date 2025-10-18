using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Bildirim servisi implementation
/// </summary>
public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService,
        ILogger<NotificationService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<bool> SendNotificationAsync(
        Guid userId,
        NotificationType type,
        NotificationPriority priority,
        string title,
        string message,
        string? entityType = null,
        Guid? entityId = null,
        string? entityName = null,
        string? actionUrl = null,
        Dictionary<string, object>? metadata = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Kullanıcı tercihlerini kontrol et
            var preference = await GetUserPreferenceAsync(userId, type, cancellationToken);
            
            // In-app bildirim kapalıysa veya öncelik yetersizse gönderme
            if (preference != null && (!preference.InAppEnabled || priority < preference.MinimumPriority))
            {
                return false;
            }

            // Sessiz saatlerde mi kontrol et
            if (IsQuietHours(preference))
            {
                return false;
            }

            var companyId = await GetUserCompanyIdAsync(userId, cancellationToken);
            if (companyId == null)
            {
                _logger.LogWarning("User {UserId} has no company", userId);
                return false;
            }

            // Bildirim oluştur
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                CompanyId = companyId.Value,
                UserId = userId,
                Type = type,
                Priority = priority,
                Title = title,
                Message = message,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                ActionUrl = actionUrl,
                Metadata = metadata != null ? JsonSerializer.Serialize(metadata) : null,
                Icon = GetDefaultIcon(type),
                Color = GetDefaultColor(type),
                IsRead = false,
                EmailSent = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser.UserId ?? Guid.Empty
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);

            // Email gönder (eğer tercih edilmişse)
            if (preference == null || preference.EmailEnabled)
            {
                _ = Task.Run(async () => await SendEmailNotificationAsync(userId, title, message, actionUrl, cancellationToken), cancellationToken);
            }

            _logger.LogInformation("Notification sent to user {UserId}: {Title}", userId, title);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification to user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> SendNotificationFromTemplateAsync(
        Guid userId,
        string templateCode,
        Dictionary<string, string> variables,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var companyId = await GetUserCompanyIdAsync(userId, cancellationToken);
            if (companyId == null)
                return false;

            // Şablonu getir
            var template = await _context.NotificationTemplates
                .Where(t => t.CompanyId == companyId.Value 
                         && t.Code == templateCode 
                         && t.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            if (template == null)
            {
                _logger.LogWarning("Notification template {TemplateCode} not found", templateCode);
                return false;
            }

            // Değişkenleri değiştir
            var title = ReplaceVariables(template.TitleTemplate, variables);
            var message = ReplaceVariables(template.MessageTemplate, variables);
            var actionUrl = template.ActionUrlTemplate != null 
                ? ReplaceVariables(template.ActionUrlTemplate, variables) 
                : null;

            return await SendNotificationAsync(
                userId,
                template.Type,
                template.DefaultPriority,
                title,
                message,
                entityType,
                entityId,
                null,
                actionUrl,
                null,
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification from template {TemplateCode}", templateCode);
            return false;
        }
    }

    public async Task<int> SendBulkNotificationAsync(
        List<Guid> userIds,
        NotificationType type,
        NotificationPriority priority,
        string title,
        string message,
        CancellationToken cancellationToken = default)
    {
        int successCount = 0;

        foreach (var userId in userIds)
        {
            var success = await SendNotificationAsync(
                userId,
                type,
                priority,
                title,
                message,
                cancellationToken: cancellationToken);

            if (success)
                successCount++;
        }

        return successCount;
    }

    public async Task SendLowStockAlertAsync(
        Guid productId,
        string productName,
        decimal currentStock,
        decimal minimumStock,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return;

        // Şirket yöneticilerine bildirim gönder
        var adminUsers = await GetCompanyAdminUsersAsync(_currentUser.CompanyId.Value, cancellationToken);

        foreach (var userId in adminUsers)
        {
            await SendNotificationAsync(
                userId,
                NotificationType.LowStock,
                NotificationPriority.High,
                "Düşük Stok Uyarısı",
                $"{productName} ürününün stok seviyesi kritik seviyede! Mevcut: {currentStock:N2}, Minimum: {minimumStock:N2}",
                "Product",
                productId,
                productName,
                $"/products/{productId}",
                cancellationToken: cancellationToken);
        }
    }

    public async Task SendOverdueInvoiceAlertAsync(
        Guid invoiceId,
        string invoiceNumber,
        DateTime dueDate,
        decimal amount,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return;

        // Şirket yöneticilerine ve finans ekibine bildirim gönder
        var adminUsers = await GetCompanyAdminUsersAsync(_currentUser.CompanyId.Value, cancellationToken);

        var daysOverdue = (DateTime.UtcNow.Date - dueDate.Date).Days;

        foreach (var userId in adminUsers)
        {
            await SendNotificationAsync(
                userId,
                NotificationType.OverdueInvoice,
                NotificationPriority.High,
                "Vadesi Geçmiş Fatura",
                $"{invoiceNumber} numaralı fatura {daysOverdue} gün gecikmiş. Tutar: {amount:N2} TRY. Vade: {dueDate:dd.MM.yyyy}",
                "Invoice",
                invoiceId,
                invoiceNumber,
                $"/invoices/{invoiceId}",
                cancellationToken: cancellationToken);
        }
    }

    public async Task SendBudgetOverrunAlertAsync(
        Guid categoryId,
        string categoryName,
        decimal budgetAmount,
        decimal spentAmount,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return;

        var adminUsers = await GetCompanyAdminUsersAsync(_currentUser.CompanyId.Value, cancellationToken);

        var overrunPercentage = ((spentAmount - budgetAmount) / budgetAmount) * 100;

        foreach (var userId in adminUsers)
        {
            await SendNotificationAsync(
                userId,
                NotificationType.BudgetOverrun,
                NotificationPriority.High,
                "Bütçe Aşımı Uyarısı",
                $"{categoryName} kategorisi için bütçe aşıldı! Bütçe: {budgetAmount:N2} TRY, Harcanan: {spentAmount:N2} TRY (%{overrunPercentage:N1} aşım)",
                "ExpenseCategory",
                categoryId,
                categoryName,
                $"/expenses/categories/{categoryId}",
                cancellationToken: cancellationToken);
        }
    }

    public async Task SendExpenseApprovalNotificationAsync(
        Guid expenseId,
        string expenseTitle,
        decimal amount,
        string submittedBy,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return;

        // Onaylayıcılara bildirim gönder (manager/admin role)
        var approvers = await GetCompanyAdminUsersAsync(_currentUser.CompanyId.Value, cancellationToken);

        foreach (var userId in approvers)
        {
            await SendNotificationAsync(
                userId,
                NotificationType.PendingApproval,
                NotificationPriority.Medium,
                "Onay Bekleyen Gider",
                $"{submittedBy} tarafından {expenseTitle} başlıklı gider onay için gönderildi. Tutar: {amount:N2} TRY",
                "Expense",
                expenseId,
                expenseTitle,
                $"/expenses/{expenseId}",
                cancellationToken: cancellationToken);
        }
    }

    public async Task SendExpenseApprovedNotificationAsync(
        Guid userId,
        Guid expenseId,
        string expenseTitle,
        string approvedBy,
        CancellationToken cancellationToken = default)
    {
        await SendNotificationAsync(
            userId,
            NotificationType.Approved,
            NotificationPriority.Medium,
            "Gider Onaylandı",
            $"{expenseTitle} başlıklı gideriniz {approvedBy} tarafından onaylandı.",
            "Expense",
            expenseId,
            expenseTitle,
            $"/expenses/{expenseId}",
            cancellationToken: cancellationToken);
    }

    public async Task SendExpenseRejectedNotificationAsync(
        Guid userId,
        Guid expenseId,
        string expenseTitle,
        string rejectedBy,
        string reason,
        CancellationToken cancellationToken = default)
    {
        await SendNotificationAsync(
            userId,
            NotificationType.Rejected,
            NotificationPriority.Medium,
            "Gider Reddedildi",
            $"{expenseTitle} başlıklı gideriniz {rejectedBy} tarafından reddedildi. Sebep: {reason}",
            "Expense",
            expenseId,
            expenseTitle,
            $"/expenses/{expenseId}",
            cancellationToken: cancellationToken);
    }

    // Helper Methods

    private async Task<NotificationPreference?> GetUserPreferenceAsync(
        Guid userId,
        NotificationType type,
        CancellationToken cancellationToken)
    {
        return await _context.NotificationPreferences
            .Where(p => p.UserId == userId && p.NotificationType == type)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<Guid?> GetUserCompanyIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        // User entity multi-tenant değil, UserCompany tablosu üzerinden şirketlere bağlanıyor
        var userCompany = await _context.UserCompanies
            .Where(uc => uc.UserId == userId)
            .Select(uc => new { uc.CompanyId })
            .FirstOrDefaultAsync(cancellationToken);

        return userCompany?.CompanyId;
    }

    private async Task<List<Guid>> GetCompanyAdminUsersAsync(Guid companyId, CancellationToken cancellationToken)
    {
        // TODO: Role-based filtering (admin, manager)
        // Şimdilik şirketteki tüm kullanıcıları döndürüyoruz
        return await _context.UserCompanies
            .Where(uc => uc.CompanyId == companyId)
            .Select(uc => uc.UserId)
            .ToListAsync(cancellationToken);
    }

    private bool IsQuietHours(NotificationPreference? preference)
    {
        if (preference == null || 
            string.IsNullOrWhiteSpace(preference.QuietHoursStart) || 
            string.IsNullOrWhiteSpace(preference.QuietHoursEnd))
        {
            return false;
        }

        var now = DateTime.UtcNow.TimeOfDay;
        
        if (TimeSpan.TryParse(preference.QuietHoursStart, out var start) &&
            TimeSpan.TryParse(preference.QuietHoursEnd, out var end))
        {
            if (start < end)
            {
                return now >= start && now <= end;
            }
            else
            {
                // Spans midnight
                return now >= start || now <= end;
            }
        }

        return false;
    }

    private async Task SendEmailNotificationAsync(
        Guid userId,
        string title,
        string message,
        string? actionUrl,
        CancellationToken cancellationToken)
    {
        try
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (user == null || string.IsNullOrWhiteSpace(user.Email))
                return;

            var userName = $"{user.FirstName} {user.LastName}".Trim();

            var emailBody = $@"
                <h2>{title}</h2>
                <p>{message}</p>
                {(actionUrl != null ? $"<p><a href='{actionUrl}'>Detayları Gör</a></p>" : "")}
            ";

            await _emailService.SendEmailAsync(
                user.Email,
                userName,
                title,
                emailBody,
                cancellationToken: cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email notification to user {UserId}", userId);
        }
    }

    private string ReplaceVariables(string template, Dictionary<string, string> variables)
    {
        var result = template;
        foreach (var variable in variables)
        {
            result = result.Replace($"{{{{{variable.Key}}}}}", variable.Value);
        }
        return result;
    }

    private string GetDefaultIcon(NotificationType type)
    {
        return type switch
        {
            NotificationType.System => "system",
            NotificationType.Info => "info",
            NotificationType.Warning => "warning",
            NotificationType.Error => "error",
            NotificationType.Success => "check_circle",
            NotificationType.Invoice => "receipt",
            NotificationType.Payment => "payment",
            NotificationType.Expense => "attach_money",
            NotificationType.Stock => "inventory",
            NotificationType.Customer => "person",
            NotificationType.LowStock => "warning",
            NotificationType.OverdueInvoice => "event_busy",
            NotificationType.BudgetOverrun => "trending_up",
            NotificationType.PaymentReminder => "notifications",
            NotificationType.PendingApproval => "pending",
            NotificationType.Approved => "check_circle",
            NotificationType.Rejected => "cancel",
            _ => "notifications"
        };
    }

    private string GetDefaultColor(NotificationType type)
    {
        return type switch
        {
            NotificationType.System => "#6366f1",
            NotificationType.Info => "#3b82f6",
            NotificationType.Warning => "#f59e0b",
            NotificationType.Error => "#ef4444",
            NotificationType.Success => "#10b981",
            NotificationType.Invoice => "#8b5cf6",
            NotificationType.Payment => "#06b6d4",
            NotificationType.Expense => "#f97316",
            NotificationType.Stock => "#84cc16",
            NotificationType.Customer => "#ec4899",
            NotificationType.LowStock => "#f59e0b",
            NotificationType.OverdueInvoice => "#ef4444",
            NotificationType.BudgetOverrun => "#dc2626",
            NotificationType.PaymentReminder => "#f59e0b",
            NotificationType.PendingApproval => "#eab308",
            NotificationType.Approved => "#10b981",
            NotificationType.Rejected => "#ef4444",
            _ => "#6b7280"
        };
    }
}

