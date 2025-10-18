using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Reports.Common;
using AccountOS.Application.Reports.ProfitLoss;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace AccountOS.Application.Reports.ProfitLoss.Queries.GetProfitLossReport;

public class GetProfitLossReportQueryHandler : IRequestHandler<GetProfitLossReportQuery, Result<ProfitLossReportDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProfitLossReportQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProfitLossReportDto>> Handle(GetProfitLossReportQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<ProfitLossReportDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Satış faturalarını getir (gelir)
        var salesInvoices = await _context.Invoices
            .Include(i => i.Items)
            .Where(i => i.CompanyId == companyId
                     && i.Type == InvoiceType.Sales
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled
                     && i.InvoiceDate >= request.StartDate
                     && i.InvoiceDate <= request.EndDate
                     && i.Currency == request.Currency)
            .ToListAsync(cancellationToken);

        // Toplam gelir hesapla
        var totalRevenue = salesInvoices.Sum(i => i.GrandTotal);

        // Toplam maliyet hesapla (FIFO cost from invoice items)
        var totalCost = salesInvoices
            .SelectMany(i => i.Items)
            .Sum(item => item.FifoCost ?? 0);

        // Özet
        var summary = new ProfitLossSummary
        {
            TotalRevenue = totalRevenue,
            TotalCost = totalCost,
            Currency = request.Currency,
            InvoiceCount = salesInvoices.Count
        };

        // Aylık kar/zarar
        var monthlyData = salesInvoices
            .GroupBy(i => new { i.InvoiceDate.Year, i.InvoiceDate.Month })
            .Select(g => new MonthlyProfitLossDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                MonthName = CultureInfo.GetCultureInfo("tr-TR").DateTimeFormat.GetMonthName(g.Key.Month),
                Revenue = g.Sum(i => i.GrandTotal),
                Cost = g.SelectMany(i => i.Items).Sum(item => item.FifoCost ?? 0),
                Currency = request.Currency
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToList();

        // Ürün karlılığı
        var productProfitability = salesInvoices
            .SelectMany(i => i.Items.Select(item => new
            {
                item.ProductId,
                item.ProductCode,
                item.ProductName,
                item.Quantity,
                item.Unit,
                Revenue = item.Total,
                Cost = item.FifoCost ?? 0
            }))
            .GroupBy(x => new { x.ProductId, x.ProductCode, x.ProductName, x.Unit })
            .Select(g => new ProductProfitabilityDto
            {
                ProductId = g.Key.ProductId,
                ProductCode = g.Key.ProductCode,
                ProductName = g.Key.ProductName,
                TotalQuantitySold = g.Sum(x => x.Quantity),
                Unit = g.Key.Unit,
                TotalRevenue = g.Sum(x => x.Revenue),
                TotalCost = g.Sum(x => x.Cost),
                Currency = request.Currency
            })
            .OrderByDescending(p => p.GrossProfit)
            .Take(20)
            .ToList();

        var report = new ProfitLossReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            DateRange = new ReportDateRange
            {
                StartDate = request.StartDate,
                EndDate = request.EndDate
            },
            Summary = summary,
            MonthlyData = monthlyData,
            ProductProfitability = productProfitability
        };

        return Result<ProfitLossReportDto>.Ok(report);
    }
}

