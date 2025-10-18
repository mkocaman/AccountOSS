using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Stock.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Stock.Queries.GetStockMovements;

/// <summary>
/// Stok hareketleri sorgu işleyicisi
/// </summary>
public class GetStockMovementsQueryHandler : IRequestHandler<GetStockMovementsQuery, Result<List<StockMovementDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetStockMovementsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<StockMovementDto>>> Handle(GetStockMovementsQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü
        if (_currentUser.CompanyId == null)
            return Result<List<StockMovementDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.StockMovements
            .Include(sm => sm.Product)
            .Where(sm => sm.CompanyId == companyId);

        // Ürün filtresi
        if (request.ProductId.HasValue)
            query = query.Where(sm => sm.ProductId == request.ProductId.Value);

        // Tarih filtresi
        if (request.StartDate.HasValue)
            query = query.Where(sm => sm.MovementDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(sm => sm.MovementDate <= request.EndDate.Value);

        var movements = await query
            .OrderByDescending(sm => sm.MovementDate)
            .ThenByDescending(sm => sm.CreatedAt)
            .Select(sm => new StockMovementDto
            {
                Id = sm.Id,
                ProductId = sm.ProductId,
                ProductName = sm.Product.Name,
                ProductCode = sm.Product.Code,
                MovementDate = sm.MovementDate,
                Type = sm.Type,
                TypeName = GetTypeName(sm.Type),
                ReferenceType = sm.ReferenceType,
                ReferenceId = sm.ReferenceId,
                Quantity = sm.Quantity,
                UnitCost = sm.UnitCost,
                TotalCost = sm.TotalCost,
                BalanceAfter = sm.BalanceAfter,
                Description = sm.Description,
                CreatedAt = sm.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<StockMovementDto>>.Ok(movements);
    }

    private static string GetTypeName(StockMovementType type)
    {
        return type switch
        {
            StockMovementType.Purchase => "Alış",
            StockMovementType.Sales => "Satış",
            StockMovementType.Return => "İade",
            StockMovementType.Transfer => "Transfer",
            StockMovementType.Adjustment => "Sayım/Düzeltme",
            _ => type.ToString()
        };
    }
}

