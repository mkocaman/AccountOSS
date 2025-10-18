using AccountOS.Domain.Enums;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Bildirim servisi
/// </summary>
public interface INotificationService
{
    /// <summary>
    /// Bildirim gönder
    /// </summary>
    Task<bool> SendNotificationAsync(
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
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Şablon kullanarak bildirim gönder
    /// </summary>
    Task<bool> SendNotificationFromTemplateAsync(
        Guid userId,
        string templateCode,
        Dictionary<string, string> variables,
        string? entityType = null,
        Guid? entityId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Toplu bildirim gönder
    /// </summary>
    Task<int> SendBulkNotificationAsync(
        List<Guid> userIds,
        NotificationType type,
        NotificationPriority priority,
        string title,
        string message,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Düşük stok uyarısı gönder
    /// </summary>
    Task SendLowStockAlertAsync(
        Guid productId,
        string productName,
        decimal currentStock,
        decimal minimumStock,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Vadesi geçmiş fatura uyarısı gönder
    /// </summary>
    Task SendOverdueInvoiceAlertAsync(
        Guid invoiceId,
        string invoiceNumber,
        DateTime dueDate,
        decimal amount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bütçe aşımı uyarısı gönder
    /// </summary>
    Task SendBudgetOverrunAlertAsync(
        Guid categoryId,
        string categoryName,
        decimal budgetAmount,
        decimal spentAmount,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gider onay bildirimi gönder
    /// </summary>
    Task SendExpenseApprovalNotificationAsync(
        Guid expenseId,
        string expenseTitle,
        decimal amount,
        string submittedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gider onaylandı bildirimi gönder
    /// </summary>
    Task SendExpenseApprovedNotificationAsync(
        Guid userId,
        Guid expenseId,
        string expenseTitle,
        string approvedBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gider reddedildi bildirimi gönder
    /// </summary>
    Task SendExpenseRejectedNotificationAsync(
        Guid userId,
        Guid expenseId,
        string expenseTitle,
        string rejectedBy,
        string reason,
        CancellationToken cancellationToken = default);
}

