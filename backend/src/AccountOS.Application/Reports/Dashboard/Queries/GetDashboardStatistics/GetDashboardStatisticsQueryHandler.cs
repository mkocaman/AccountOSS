using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Reports.Common;
using AccountOS.Application.Reports.Dashboard;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Reports.Dashboard.Queries.GetDashboardStatistics;

public class GetDashboardStatisticsQueryHandler 
    : IRequestHandler<GetDashboardStatisticsQuery, Result<DashboardStatisticsDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardStatisticsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<DashboardStatisticsDto>> Handle(
        GetDashboardStatisticsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<DashboardStatisticsDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var today = DateTime.UtcNow.Date;
        var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);
        var firstDayOfLastMonth = firstDayOfMonth.AddMonths(-1);
        var lastDayOfLastMonth = firstDayOfMonth.AddDays(-1);

        // === SATIŞLAR ===
        var salesThisMonth = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= firstDayOfMonth
                     && i.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var salesLastMonth = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= firstDayOfLastMonth
                     && i.InvoiceDate <= lastDayOfLastMonth
                     && i.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var salesThisMonthTotal = salesThisMonth.Sum(i => i.GrandTotal);
        var salesLastMonthTotal = salesLastMonth.Sum(i => i.GrandTotal);

        var salesStats = new SalesStatistics
        {
            ThisMonth = salesThisMonthTotal,
            LastMonth = salesLastMonthTotal,
            Comparison = new PeriodComparison
            {
                CurrentPeriod = salesThisMonthTotal,
                PreviousPeriod = salesLastMonthTotal
            },
            InvoiceCount = salesThisMonth.Count,
            AverageInvoiceValue = salesThisMonth.Any() 
                ? salesThisMonthTotal / salesThisMonth.Count 
                : 0,
            Currency = request.Currency
        };

        // === ALIŞLAR ===
        var purchasesThisMonth = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Purchase
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= firstDayOfMonth
                     && i.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var purchasesLastMonth = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Purchase
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= firstDayOfLastMonth
                     && i.InvoiceDate <= lastDayOfLastMonth
                     && i.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var purchasesThisMonthTotal = purchasesThisMonth.Sum(i => i.GrandTotal);
        var purchasesLastMonthTotal = purchasesLastMonth.Sum(i => i.GrandTotal);

        var purchaseStats = new PurchaseStatistics
        {
            ThisMonth = purchasesThisMonthTotal,
            LastMonth = purchasesLastMonthTotal,
            Comparison = new PeriodComparison
            {
                CurrentPeriod = purchasesThisMonthTotal,
                PreviousPeriod = purchasesLastMonthTotal
            },
            InvoiceCount = purchasesThisMonth.Count,
            AverageInvoiceValue = purchasesThisMonth.Any() 
                ? purchasesThisMonthTotal / purchasesThisMonth.Count 
                : 0,
            Currency = request.Currency
        };

        // === ÖDEMELER ===
        var paymentsThisMonth = await _context.Payments
            .Where(p => p.CompanyId == companyId
                     && p.PaymentDate >= firstDayOfMonth
                     && p.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var totalReceived = paymentsThisMonth
            .Where(p => p.Type == PaymentType.Receipt)
            .Sum(p => p.Amount);

        var totalPaid = paymentsThisMonth
            .Where(p => p.Type == PaymentType.Payment)
            .Sum(p => p.Amount);

        // Bekleyen tahsilatlar
        var pendingReceivables = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Paid
                     && i.Status != InvoiceStatus.Cancelled
                     && i.RemainingAmount > 0
                     && i.Currency == request.Currency)
            .SumAsync(i => i.RemainingAmount, cancellationToken);

        // Vadesi geçmiş alacaklar
        var overdueReceivables = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Paid
                     && i.Status != InvoiceStatus.Cancelled
                     && i.RemainingAmount > 0
                     && i.DueDate.HasValue
                     && i.DueDate.Value < today
                     && i.Currency == request.Currency)
            .SumAsync(i => i.RemainingAmount, cancellationToken);

        var paymentStats = new PaymentStatistics
        {
            TotalReceived = totalReceived,
            TotalPaid = totalPaid,
            PendingReceivables = pendingReceivables,
            OverdueReceivables = overdueReceivables,
            Currency = request.Currency
        };

        // === MÜŞTERİLER ===
        var totalCustomers = await _context.Customers
            .Where(c => c.CompanyId == companyId)
            .CountAsync(cancellationToken);

        var activeCustomers = await _context.Invoices
            .Where(i => i.CompanyId == companyId
                     && i.InvoiceDate >= firstDayOfMonth.AddMonths(-3))
            .Select(i => i.CustomerId)
            .Distinct()
            .CountAsync(cancellationToken);

        var newCustomersThisMonth = await _context.Customers
            .Where(c => c.CompanyId == companyId
                     && c.CreatedAt >= firstDayOfMonth)
            .CountAsync(cancellationToken);

        // En çok alışveriş yapan müşteriler (son 3 ay)
        var topCustomers = await _context.Invoices
            .Include(i => i.Customer)
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= firstDayOfMonth.AddMonths(-3)
                     && i.Currency == request.Currency)
            .GroupBy(i => new { i.CustomerId, i.Customer.Code, i.Customer.Name })
            .Select(g => new TopCustomerDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerCode = g.Key.Code,
                CustomerName = g.Key.Name,
                TotalPurchases = g.Sum(i => i.GrandTotal),
                Currency = request.Currency
            })
            .OrderByDescending(c => c.TotalPurchases)
            .Take(5)
            .ToListAsync(cancellationToken);

        var customerStats = new CustomerStatistics
        {
            TotalCustomers = totalCustomers,
            ActiveCustomers = activeCustomers,
            NewCustomersThisMonth = newCustomersThisMonth,
            TopCustomers = topCustomers
        };

        // === STOK ===
        var totalProducts = await _context.Products
            .Where(p => p.CompanyId == companyId 
                     && p.Type == ProductType.Goods
                     && p.TrackStock)
            .CountAsync(cancellationToken);

        var lowStockProducts = await _context.Products
            .Where(p => p.CompanyId == companyId 
                     && p.Type == ProductType.Goods
                     && p.TrackStock
                     && p.StockQuantity < p.MinStockLevel
                     && p.MinStockLevel > 0)
            .CountAsync(cancellationToken);

        var outOfStockProducts = await _context.Products
            .Where(p => p.CompanyId == companyId 
                     && p.Type == ProductType.Goods
                     && p.TrackStock
                     && p.StockQuantity <= 0)
            .CountAsync(cancellationToken);

        // Toplam stok değeri
        var stockLayers = await _context.StockLayers
            .Where(l => l.CompanyId == companyId
                     && l.RemainingQuantity > 0
                     && l.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        var totalStockValue = stockLayers.Sum(l => l.RemainingQuantity * l.UnitCost);

        var stockStats = new StockStatistics
        {
            TotalProducts = totalProducts,
            LowStockProducts = lowStockProducts,
            OutOfStockProducts = outOfStockProducts,
            TotalStockValue = totalStockValue,
            Currency = request.Currency
        };

        // === SON FAALİYETLER ===
        var recentInvoices = await _context.Invoices
            .Include(i => i.Customer)
            .Where(i => i.CompanyId == companyId)
            .OrderByDescending(i => i.CreatedAt)
            .Take(5)
            .Select(i => new RecentActivityDto
            {
                Timestamp = i.CreatedAt,
                ActivityType = i.Type == InvoiceType.Sales ? "Satış Faturası" : "Alış Faturası",
                Description = $"{i.InvoiceNumber} - {i.Customer.Name}",
                ReferenceNumber = i.InvoiceNumber,
                Amount = i.GrandTotal,
                Currency = i.Currency
            })
            .ToListAsync(cancellationToken);

        var recentPayments = await _context.Payments
            .Include(p => p.Customer)
            .Where(p => p.CompanyId == companyId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new RecentActivityDto
            {
                Timestamp = p.CreatedAt,
                ActivityType = p.Type == PaymentType.Receipt ? "Tahsilat" : "Ödeme",
                Description = $"{p.PaymentNumber} - {p.Customer.Name}",
                ReferenceNumber = p.PaymentNumber,
                Amount = p.Amount,
                Currency = p.Currency
            })
            .ToListAsync(cancellationToken);

        var recentActivities = recentInvoices
            .Concat(recentPayments)
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToList();

        var dashboard = new DashboardStatisticsDto
        {
            GeneratedAt = DateTime.UtcNow,
            Sales = salesStats,
            Purchases = purchaseStats,
            Payments = paymentStats,
            Customers = customerStats,
            Stock = stockStats,
            RecentActivities = recentActivities
        };

        return Result<DashboardStatisticsDto>.Ok(dashboard);
    }
}

