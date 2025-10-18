using AccountOS.Api.Controllers;
using AccountOS.Application.Reports.CustomerBalances.Queries.GetCustomerBalanceReport;
using AccountOS.Application.Reports.Dashboard.Queries.GetDashboardStatistics;
using AccountOS.Application.Reports.ProfitLoss.Queries.GetProfitLossReport;
using AccountOS.Application.Reports.Purchases.Queries.GetPurchaseReport;
using AccountOS.Application.Reports.Sales.Queries.GetSalesReport;
using AccountOS.Application.Reports.Stock.Queries.GetStockReport;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Rapor ve analiz endpointleri
/// </summary>
[Authorize]
public class ReportsController : BaseApiController
{
    /// <summary>
    /// Dashboard istatistiklerini getir
    /// </summary>
    [HttpGet("dashboard")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.Dashboard.DashboardStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboardStatistics([FromQuery] string currency = "TRY")
    {
        var result = await Mediator.Send(new GetDashboardStatisticsQuery
        {
            Currency = currency
        });

        return Ok(result);
    }

    /// <summary>
    /// Satış raporu getir
    /// </summary>
    [HttpGet("sales")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.Sales.SalesReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalesReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] Guid? customerId = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] string currency = "TRY",
        [FromQuery] bool includeComparison = true)
    {
        var result = await Mediator.Send(new GetSalesReportQuery
        {
            StartDate = startDate,
            EndDate = endDate,
            CustomerId = customerId,
            ProductId = productId,
            Currency = currency,
            IncludeComparison = includeComparison
        });

        return Ok(result);
    }

    /// <summary>
    /// Alış raporu getir
    /// </summary>
    [HttpGet("purchases")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.Purchases.PurchaseReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPurchaseReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] Guid? productId = null,
        [FromQuery] string currency = "TRY",
        [FromQuery] bool includeComparison = true)
    {
        var result = await Mediator.Send(new GetPurchaseReportQuery
        {
            StartDate = startDate,
            EndDate = endDate,
            SupplierId = supplierId,
            ProductId = productId,
            Currency = currency,
            IncludeComparison = includeComparison
        });

        return Ok(result);
    }

    /// <summary>
    /// Kar/Zarar raporu getir
    /// </summary>
    [HttpGet("profit-loss")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.ProfitLoss.ProfitLossReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProfitLossReport(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate,
        [FromQuery] string currency = "TRY")
    {
        var result = await Mediator.Send(new GetProfitLossReportQuery
        {
            StartDate = startDate,
            EndDate = endDate,
            Currency = currency
        });

        return Ok(result);
    }

    /// <summary>
    /// Stok raporu getir
    /// </summary>
    [HttpGet("stock")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.Stock.StockReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockReport(
        [FromQuery] string currency = "TRY",
        [FromQuery] bool includeLowStockOnly = false)
    {
        var result = await Mediator.Send(new GetStockReportQuery
        {
            Currency = currency,
            IncludeLowStockOnly = includeLowStockOnly
        });

        return Ok(result);
    }

    /// <summary>
    /// Cari hesap bakiye raporu getir
    /// </summary>
    [HttpGet("customer-balances")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.CustomerBalances.CustomerBalanceReportDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomerBalanceReport(
        [FromQuery] string currency = "TRY",
        [FromQuery] bool includeAging = true)
    {
        var result = await Mediator.Send(new GetCustomerBalanceReportQuery
        {
            Currency = currency,
            IncludeAging = includeAging
        });

        return Ok(result);
    }
}

