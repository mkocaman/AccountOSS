using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Stock.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Stock.Queries.GetStockLayers;

/// <summary>
/// Stok katmanları sorgu işleyicisi
/// </summary>
public class GetStockLayersQueryHandler : IRequestHandler<GetStockLayersQuery, Result<List<StockLayerDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetStockLayersQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<StockLayerDto>>> Handle(GetStockLayersQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü
        if (_currentUser.CompanyId == null)
            return Result<List<StockLayerDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.StockLayers
            .Include(sl => sl.Product)
            .Where(sl => sl.CompanyId == companyId);

        // Ürün filtresi
        if (request.ProductId.HasValue)
            query = query.Where(sl => sl.ProductId == request.ProductId.Value);

        // Aktif katmanlar
        if (request.ActiveOnly)
            query = query.Where(sl => sl.RemainingQuantity > 0);

        var layers = await query
            .OrderBy(sl => sl.EntryDate)
            .ThenBy(sl => sl.CreatedAt)
            .Select(sl => new StockLayerDto
            {
                Id = sl.Id,
                ProductId = sl.ProductId,
                ProductName = sl.Product.Name,
                ProductCode = sl.Product.Code,
                EntryDate = sl.EntryDate,
                ReferenceType = sl.ReferenceType,
                ReferenceId = sl.ReferenceId,
                EntryQuantity = sl.EntryQuantity,
                RemainingQuantity = sl.RemainingQuantity,
                ConsumedQuantity = sl.EntryQuantity - sl.RemainingQuantity,
                UnitCost = sl.UnitCost,
                Currency = sl.Currency,
                UnitCostInBase = sl.UnitCostInBase,
                BaseCurrency = sl.BaseCurrency,
                ExchangeRate = sl.ExchangeRate,
                Status = sl.RemainingQuantity > 0 ? "Active" : "Consumed"
            })
            .ToListAsync(cancellationToken);

        return Result<List<StockLayerDto>>.Ok(layers);
    }
}

