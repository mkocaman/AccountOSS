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

                // 1. Düşük stok kontrolü (StockLayer-based)
                await CheckLowStockAsync(context, notificationService, stoppingToken);

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

    private async Task CheckLowStockAsync(
        IApplicationDbContext context,
        INotificationService notificationService,
        CancellationToken cancellationToken)
    {
        try
        {
            // Her ürün için toplam remaining stock hesapla
            var productStocks = await context.StockLayers
                .Where(sl => sl.RemainingQuantity > 0)
                .GroupBy(sl => new { sl.ProductId, sl.CompanyId })
                .Select(g => new
                {
                    g.Key.ProductId,
                    g.Key.CompanyId,
                    TotalStock = g.Sum(sl => sl.RemainingQuantity)
                })
                .ToListAsync(cancellationToken);

            foreach (var stock in productStocks)
            {
                // TODO: MinimumStock Product entity'de yok - şimdilik sabit değer (10) kullanıyoruz
                var minimumStock = 10m;

                if (stock.TotalStock <= minimumStock)
                {
                    // Ürün bilgisini al
                    var product = await context.Products
                        .Where(p => p.Id == stock.ProductId)
                        .Select(p => new { p.Id, p.Name, p.CompanyId })
                        .FirstOrDefaultAsync(cancellationToken);

                    if (product == null)
                        continue;

                    // Son 24 saatte alert gönderilmiş mi?
                    var recentAlert = await context.Notifications
                        .Where(n => n.Type == NotificationType.LowStock
                                 && n.EntityType == "Product"
                                 && n.EntityId == product.Id
                                 && n.CreatedAt > DateTime.UtcNow.AddHours(-24))
                        .AnyAsync(cancellationToken);

                    if (!recentAlert)
                    {
                        await notificationService.SendLowStockAlertAsync(
                            product.Id,
                            product.Name,
                            stock.TotalStock,
                            minimumStock,
                            cancellationToken);

                        _logger.LogInformation("Low stock alert sent for product {ProductName}", product.Name);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking low stock");
        }
    }

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

