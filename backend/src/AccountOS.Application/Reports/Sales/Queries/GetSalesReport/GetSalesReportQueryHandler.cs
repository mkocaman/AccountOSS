using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Reports.Common;
using AccountOS.Application.Reports.Sales;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace AccountOS.Application.Reports.Sales.Queries.GetSalesReport;

public class GetSalesReportQueryHandler : IRequestHandler<GetSalesReportQuery, Result<SalesReportDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetSalesReportQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<SalesReportDto>> Handle(GetSalesReportQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<SalesReportDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Satış faturalarını getir
        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= request.StartDate
                     && i.InvoiceDate <= request.EndDate);

        if (request.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == request.CustomerId.Value);

        if (request.ProductId.HasValue)
            query = query.Where(i => i.Items.Any(item => item.ProductId == request.ProductId.Value));

        var invoices = await query.ToListAsync(cancellationToken);

        // Para birimine göre filtrele
        var filteredInvoices = invoices.Where(i => i.Currency == request.Currency).ToList();

        // Özet hesapla
        var summary = new SalesReportSummary
        {
            TotalInvoices = filteredInvoices.Count,
            TotalAmount = filteredInvoices.Sum(i => i.GrandTotal),
            TotalVat = filteredInvoices.Sum(i => i.VatTotal),
            TotalDiscount = filteredInvoices.Sum(i => i.Items.Sum(item => item.DiscountAmount)),
            Currency = request.Currency,
            ByCurrency = invoices
                .GroupBy(i => i.Currency)
                .Select(g => new CurrencyAmount
                {
                    Currency = g.Key,
                    Amount = g.Sum(i => i.GrandTotal)
                })
                .ToList()
        };

        // Önceki dönemle karşılaştırma
        if (request.IncludeComparison)
        {
            var daysDifference = (request.EndDate - request.StartDate).Days;
            var previousStart = request.StartDate.AddDays(-daysDifference - 1);
            var previousEnd = request.StartDate.AddDays(-1);

            var previousInvoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId
                         && i.Type == InvoiceType.Sales
                         && i.Status != InvoiceStatus.Draft
                         && i.Status != InvoiceStatus.Cancelled
                         && i.InvoiceDate >= previousStart
                         && i.InvoiceDate <= previousEnd
                         && i.Currency == request.Currency)
                .ToListAsync(cancellationToken);

            summary = summary with
            {
                Comparison = new PeriodComparison
                {
                    CurrentPeriod = summary.TotalAmount,
                    PreviousPeriod = previousInvoices.Sum(i => i.GrandTotal)
                }
            };
        }

        // Günlük satışlar
        var dailySales = filteredInvoices
            .GroupBy(i => i.InvoiceDate.Date)
            .Select(g => new DailySalesDto
            {
                Date = g.Key,
                InvoiceCount = g.Count(),
                TotalAmount = g.Sum(i => i.GrandTotal),
                TotalVat = g.Sum(i => i.VatTotal),
                Currency = request.Currency
            })
            .OrderBy(d => d.Date)
            .ToList();

        // Aylık satışlar
        var monthlySales = filteredInvoices
            .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
            .Select(g => new MonthlySalesDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = CultureInfo.GetCultureInfo("tr-TR").DateTimeFormat.GetMonthName(g.Key.Month),
                InvoiceCount = g.Count(),
                TotalAmount = g.Sum(i => i.GrandTotal),
                TotalVat = g.Sum(i => i.VatTotal),
                Currency = request.Currency
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToList();

        // Müşterilere göre satışlar
        var salesByCustomer = filteredInvoices
            .GroupBy(i => new { i.CustomerId, i.Customer.Code, i.Customer.Name })
            .Select(g => new SalesByCustomerDto
            {
                CustomerId = g.Key.CustomerId,
                CustomerCode = g.Key.Code,
                CustomerName = g.Key.Name,
                InvoiceCount = g.Count(),
                TotalAmount = g.Sum(i => i.GrandTotal),
                Currency = request.Currency,
                Percentage = summary.TotalAmount > 0 
                    ? (g.Sum(i => i.GrandTotal) / summary.TotalAmount) * 100 
                    : 0
            })
            .OrderByDescending(s => s.TotalAmount)
            .Take(10)
            .ToList();

        // Ürünlere göre satışlar
        var salesByProduct = filteredInvoices
            .SelectMany(i => i.Items.Select(item => new
            {
                i.Currency,
                item.ProductId,
                item.ProductCode,
                item.ProductName,
                item.Quantity,
                item.Unit,
                item.Total
            }))
            .Where(x => x.Currency == request.Currency)
            .GroupBy(x => new { x.ProductId, x.ProductCode, x.ProductName, x.Unit })
            .Select(g => new SalesByProductDto
            {
                ProductId = g.Key.ProductId,
                ProductCode = g.Key.ProductCode,
                ProductName = g.Key.ProductName,
                TotalQuantity = g.Sum(x => x.Quantity),
                Unit = g.Key.Unit,
                TotalAmount = g.Sum(x => x.Total),
                Currency = request.Currency,
                AveragePrice = g.Sum(x => x.Quantity) > 0 
                    ? g.Sum(x => x.Total) / g.Sum(x => x.Quantity)
                    : 0
            })
            .OrderByDescending(s => s.TotalAmount)
            .Take(10)
            .ToList();

        var report = new SalesReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            DateRange = new ReportDateRange
            {
                StartDate = request.StartDate,
                EndDate = request.EndDate
            },
            Summary = summary,
            DailySales = dailySales,
            MonthlySales = monthlySales,
            SalesByCustomer = salesByCustomer,
            SalesByProduct = salesByProduct
        };

        return Result<SalesReportDto>.Ok(report);
    }
}

