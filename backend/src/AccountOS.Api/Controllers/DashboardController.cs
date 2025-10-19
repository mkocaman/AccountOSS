using AccountOS.Api.Controllers;
using AccountOS.Application.Reports.Dashboard.Queries.GetDashboardStatistics;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Dashboard endpointleri
/// </summary>
[Authorize]
public class DashboardController : BaseApiController
{
    /// <summary>
    /// Dashboard metriklerini getir
    /// </summary>
    [HttpGet("metrics")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Reports.Dashboard.DashboardStatisticsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMetrics([FromQuery] string currency = "TRY")
    {
        var result = await Mediator.Send(new GetDashboardStatisticsQuery
        {
            Currency = currency
        });

        return Ok(result);
    }

    /// <summary>
    /// Satış grafik verilerini getir
    /// </summary>
    [HttpGet("sales-chart")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalesChart(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string currency = "TRY")
    {
        // Şimdilik boş data döndürüyoruz, gerçek implementasyon gerekli
        var result = new Application.Common.Result<object>
        {
            Success = true,
            Data = new[]
            {
                new { month = "Ocak", sales = 12000 },
                new { month = "Şubat", sales = 15000 },
                new { month = "Mart", sales = 18000 },
                new { month = "Nisan", sales = 22000 },
                new { month = "Mayıs", sales = 19000 },
                new { month = "Haziran", sales = 25000 }
            }
        };

        return Ok(result);
    }

    /// <summary>
    /// Ödeme grafik verilerini getir
    /// </summary>
    [HttpGet("payment-chart")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPaymentChart(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] string currency = "TRY")
    {
        // Şimdilik boş data döndürüyoruz, gerçek implementasyon gerekli
        var result = new Application.Common.Result<object>
        {
            Success = true,
            Data = new[]
            {
                new { month = "Ocak", payments = 8000 },
                new { month = "Şubat", payments = 12000 },
                new { month = "Mart", payments = 15000 },
                new { month = "Nisan", payments = 18000 },
                new { month = "Mayıs", payments = 16000 },
                new { month = "Haziran", payments = 20000 }
            }
        };

        return Ok(result);
    }

    /// <summary>
    /// En iyi müşterileri getir
    /// </summary>
    [HttpGet("top-customers")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTopCustomers(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int limit = 10)
    {
        // Şimdilik boş data döndürüyoruz, gerçek implementasyon gerekli
        var result = new Application.Common.Result<object>
        {
            Success = true,
            Data = new[]
            {
                new { id = Guid.NewGuid(), name = "ABC Şirketi", totalSales = 45000, orderCount = 12 },
                new { id = Guid.NewGuid(), name = "XYZ Ltd.", totalSales = 38000, orderCount = 8 },
                new { id = Guid.NewGuid(), name = "DEF A.Ş.", totalSales = 32000, orderCount = 15 },
                new { id = Guid.NewGuid(), name = "GHI Ltd.", totalSales = 28000, orderCount = 6 },
                new { id = Guid.NewGuid(), name = "JKL Şirketi", totalSales = 25000, orderCount = 9 }
            }
        };

        return Ok(result);
    }

    /// <summary>
    /// Düşük stoklu ürünleri getir
    /// </summary>
    [HttpGet("low-stock")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLowStockProducts()
    {
        // Şimdilik boş data döndürüyoruz, gerçek implementasyon gerekli
        var result = new Application.Common.Result<object>
        {
            Success = true,
            Data = new[]
            {
                new { id = Guid.NewGuid(), name = "Ürün A", currentStock = 5, minStock = 10 },
                new { id = Guid.NewGuid(), name = "Ürün B", currentStock = 3, minStock = 15 },
                new { id = Guid.NewGuid(), name = "Ürün C", currentStock = 8, minStock = 20 },
                new { id = Guid.NewGuid(), name = "Ürün D", currentStock = 2, minStock = 12 }
            }
        };

        return Ok(result);
    }

    /// <summary>
    /// Son faturaları getir
    /// </summary>
    [HttpGet("recent-invoices")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRecentInvoices(
        [FromQuery] DateTime? dateFrom = null,
        [FromQuery] DateTime? dateTo = null,
        [FromQuery] int limit = 10)
    {
        // Şimdilik boş data döndürüyoruz, gerçek implementasyon gerekli
        var result = new Application.Common.Result<object>
        {
            Success = true,
            Data = new[]
            {
                new { 
                    id = Guid.NewGuid(), 
                    invoiceNumber = "FAT-2024-001", 
                    customerName = "ABC Şirketi", 
                    amount = 15000, 
                    date = DateTime.Now.AddDays(-1),
                    status = "Ödendi"
                },
                new { 
                    id = Guid.NewGuid(), 
                    invoiceNumber = "FAT-2024-002", 
                    customerName = "XYZ Ltd.", 
                    amount = 22000, 
                    date = DateTime.Now.AddDays(-2),
                    status = "Beklemede"
                },
                new { 
                    id = Guid.NewGuid(), 
                    invoiceNumber = "FAT-2024-003", 
                    customerName = "DEF A.Ş.", 
                    amount = 18000, 
                    date = DateTime.Now.AddDays(-3),
                    status = "Ödendi"
                }
            }
        };

        return Ok(result);
    }
}
