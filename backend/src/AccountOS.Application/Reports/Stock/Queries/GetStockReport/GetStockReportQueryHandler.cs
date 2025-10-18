using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Reports.Stock;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Reports.Stock.Queries.GetStockReport;

public class GetStockReportQueryHandler : IRequestHandler<GetStockReportQuery, Result<StockReportDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IStockService _stockService;

    public GetStockReportQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IStockService stockService)
    {
        _context = context;
        _currentUser = currentUser;
        _stockService = stockService;
    }

    public async Task<Result<StockReportDto>> Handle(GetStockReportQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<StockReportDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Tüm ürünleri getir (sadece Goods ve stok takipli)
        var products = await _context.Products
            .Where(p => p.CompanyId == companyId 
                     && p.Type == Domain.Enums.ProductType.Goods
                     && p.TrackStock)
            .ToListAsync(cancellationToken);

        var stockLevels = new List<StockLevelDto>();

        foreach (var product in products)
        {
            // Stok miktarı hesapla
            var quantity = await _stockService.CalculateStockQuantityAsync(
                product.Id, 
                cancellationToken);

            var averageCost = 0m;
            if (quantity > 0)
            {
                var stockLayers = await _context.StockLayers
                    .Where(l => l.CompanyId == companyId
                             && l.ProductId == product.Id
                             && l.RemainingQuantity > 0
                             && l.Currency == request.Currency)
                    .ToListAsync(cancellationToken);

                if (stockLayers.Any())
                {
                    var totalCost = stockLayers.Sum(l => l.RemainingQuantity * l.UnitCost);
                    var totalQuantity = stockLayers.Sum(l => l.RemainingQuantity);
                    averageCost = totalQuantity > 0 ? totalCost / totalQuantity : 0;
                }
            }

            var stockLevel = new StockLevelDto
            {
                ProductId = product.Id,
                ProductCode = product.Code,
                ProductName = product.Name,
                CurrentQuantity = quantity,
                Unit = product.Unit,
                MinStockLevel = product.MinStockLevel,
                AverageCost = averageCost,
                TotalValue = quantity * averageCost,
                Currency = request.Currency
            };

            // Düşük stok filtresi
            if (request.IncludeLowStockOnly)
            {
                if (stockLevel.IsLowStock || stockLevel.IsOutOfStock)
                    stockLevels.Add(stockLevel);
            }
            else
            {
                stockLevels.Add(stockLevel);
            }
        }

        // Düşük stok uyarıları
        var lowStockAlerts = stockLevels
            .Where(s => s.IsLowStock || s.IsOutOfStock)
            .Select(s => new LowStockAlertDto
            {
                ProductId = s.ProductId,
                ProductCode = s.ProductCode,
                ProductName = s.ProductName,
                CurrentQuantity = s.CurrentQuantity,
                MinStockLevel = s.MinStockLevel,
                Unit = s.Unit
            })
            .OrderBy(a => a.CurrentQuantity)
            .ToList();

        // Özet
        var summary = new StockReportSummary
        {
            TotalProducts = products.Count,
            ProductsInStock = stockLevels.Count(s => s.CurrentQuantity > 0),
            OutOfStockProducts = stockLevels.Count(s => s.IsOutOfStock),
            LowStockProducts = stockLevels.Count(s => s.IsLowStock),
            TotalStockValue = stockLevels.Sum(s => s.TotalValue),
            Currency = request.Currency
        };

        var report = new StockReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            Summary = summary,
            StockLevels = stockLevels.OrderBy(s => s.ProductCode).ToList(),
            LowStockAlerts = lowStockAlerts
        };

        return Result<StockReportDto>.Ok(report);
    }
}

