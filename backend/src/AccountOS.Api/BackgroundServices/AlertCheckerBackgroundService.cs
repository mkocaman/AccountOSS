using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Api.BackgroundServices;

/// <summary>
/// Periyodik alert kontrolü yapan background service
/// </summary>
public class AlertCheckerBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AlertCheckerBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1); // Her saat kontrol et

    public AlertCheckerBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<AlertCheckerBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Alert Checker Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // 1. Düşük stok kontrolü - TODO: Product entity'de CurrentStock/MinimumStock field'ları yok (StockLayer ile yapılıyor)
                // await CheckLowStockAsync(context, notificationService, stoppingToken);

                // 2. Vadesi geçmiş fatura kontrolü
                await CheckOverdueInvoicesAsync(context, notificationService, stoppingToken);

                // 3. Bütçe aşımı kontrolü
                await CheckBudgetOverrunAsync(context, notificationService, stoppingToken);

                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in alert checker");
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
            }
        }

        _logger.LogInformation("Alert Checker Background Service stopped");
    }

    // TODO: CheckLowStockAsync - Product entity'de CurrentStock/MinimumStock yok (StockLayer ile yapılıyor)
    // Gelecekte StockLayer bazlı low stock alert eklenebilir
    /*
    private async Task CheckLowStockAsync(
        IApplicationDbContext context,
        INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        // Implementation removed - needs StockLayer integration
    }
    */

    private async Task CheckOverdueInvoicesAsync(
        IApplicationDbContext context,
        INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        try
        {
            var today = DateTime.UtcNow.Date;

            // Vadesi geçmiş, ödenmemiş faturaları bul
            var overdueInvoices = await context.Invoices
                .Where(i => i.DueDate.HasValue
                         && i.DueDate.Value.Date < today
                         && i.RemainingAmount > 0
                         && (i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.PartiallyPaid))
                .Select(i => new
                {
                    i.Id,
                    i.InvoiceNumber,
                    i.DueDate,
                    i.RemainingAmount,
                    i.CompanyId
                })
                .ToListAsync(cancellationToken);

            foreach (var invoice in overdueInvoices)
            {
                // Son 24 saatte bu fatura için alert gönderilmiş mi kontrol et
                var recentAlert = await context.Notifications
                    .Where(n => n.Type == NotificationType.OverdueInvoice
                             && n.EntityType == "Invoice"
                             && n.EntityId == invoice.Id
                             && n.CreatedAt > DateTime.UtcNow.AddHours(-24))
                    .AnyAsync(cancellationToken);

                if (!recentAlert)
                {
                    await notificationService.SendOverdueInvoiceAlertAsync(
                        invoice.Id,
                        invoice.InvoiceNumber,
                        invoice.DueDate!.Value,
                        invoice.RemainingAmount,
                        cancellationToken);

                    _logger.LogInformation("Overdue invoice alert sent for {InvoiceNumber}", invoice.InvoiceNumber);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking overdue invoices");
        }
    }

    private async Task CheckBudgetOverrunAsync(
        IApplicationDbContext context,
        INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        try
        {
            var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);

            // Bütçesi olan kategorileri getir
            var categories = await context.ExpenseCategories
                .Where(c => c.MonthlyBudget.HasValue && c.MonthlyBudget.Value > 0)
                .Select(c => new
                {
                    c.Id,
                    c.Name,
                    c.MonthlyBudget,
                    c.Currency,
                    c.CompanyId
                })
                .ToListAsync(cancellationToken);

            foreach (var category in categories)
            {
                // Bu ay bu kategoride harcanan tutarı hesapla
                var spentAmount = await context.Expenses
                    .Where(e => e.CategoryId == category.Id
                             && e.ExpenseDate >= startOfMonth
                             && e.ExpenseDate <= endOfMonth
                             && e.Status == ExpenseStatus.Paid
                             && e.Currency == category.Currency)
                    .SumAsync(e => e.Amount, cancellationToken);

                // Bütçe aşıldı mı?
                if (spentAmount > category.MonthlyBudget!.Value)
                {
                    // Bu ay bu kategori için alert gönderilmiş mi kontrol et
                    var recentAlert = await context.Notifications
                        .Where(n => n.Type == NotificationType.BudgetOverrun
                                 && n.EntityType == "ExpenseCategory"
                                 && n.EntityId == category.Id
                                 && n.CreatedAt >= startOfMonth)
                        .AnyAsync(cancellationToken);

                    if (!recentAlert)
                    {
                        await notificationService.SendBudgetOverrunAlertAsync(
                            category.Id,
                            category.Name,
                            category.MonthlyBudget.Value,
                            spentAmount,
                            cancellationToken);

                        _logger.LogInformation("Budget overrun alert sent for category {CategoryName}", category.Name);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking budget overrun");
        }
    }
}

