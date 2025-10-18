using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Stok yönetim servisi implementasyonu
/// FIFO (First-In-First-Out) mantığı ile stok takibi
/// </summary>
public class StockService : IStockService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<StockService> _logger;

    public StockService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILogger<StockService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    /// <summary>
    /// Stok girişi yap (FIFO layer oluştur)
    /// </summary>
    public async Task<decimal> AddStockAsync(
        Guid productId,
        decimal quantity,
        decimal unitCost,
        string currency,
        string referenceType,
        Guid referenceId,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            throw new UnauthorizedAccessException("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId ?? Guid.Empty;

        // Ürünü getir
        var product = await _context.Products
            .Where(p => p.Id == productId && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Ürün bulunamadı");

        // Şirketin base currency'sini al
        var company = await _context.Companies
            .Where(c => c.Id == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        var baseCurrency = company?.BaseCurrency ?? "TRY";
        decimal exchangeRate = 1m;
        decimal unitCostInBase = unitCost;

        // Eğer farklı para birimi ise kur hesapla
        if (currency != baseCurrency)
        {
            // Kur getir (basitleştirilmiş - gerçekte FxRate'den gelecek)
            // TODO: IFxRateService kullan
            exchangeRate = 1m; // Placeholder
            unitCostInBase = unitCost * exchangeRate;
        }

        // Yeni stok katmanı oluştur
        var layer = new StockLayer
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            ProductId = productId,
            EntryDate = DateTime.UtcNow,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            EntryQuantity = quantity,
            RemainingQuantity = quantity,
            UnitCost = unitCost,
            Currency = currency,
            UnitCostInBase = unitCostInBase,
            BaseCurrency = baseCurrency,
            ExchangeRate = exchangeRate,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.StockLayers.Add(layer);

        // Stok hareketi kaydet
        var currentBalance = await CalculateStockQuantityAsync(productId, cancellationToken);
        var newBalance = currentBalance + quantity;

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            ProductId = productId,
            MovementDate = DateTime.UtcNow,
            Type = referenceType == "Purchase" ? StockMovementType.Purchase : StockMovementType.Adjustment,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            Quantity = quantity,
            UnitCost = unitCostInBase,
            TotalCost = unitCostInBase * quantity,
            BalanceAfter = newBalance,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.StockMovements.Add(movement);

        // Product.StockQuantity güncelle
        product.StockQuantity = newBalance;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Stock added: Product={ProductId}, Quantity={Quantity}, UnitCost={UnitCost}, NewBalance={Balance}",
            productId, quantity, unitCostInBase, newBalance);

        return newBalance;
    }

    /// <summary>
    /// Stok çıkışı yap - FIFO mantığı ile
    /// </summary>
    public async Task<decimal> RemoveStockAsync(
        Guid productId,
        decimal quantity,
        string referenceType,
        Guid referenceId,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            throw new UnauthorizedAccessException("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId ?? Guid.Empty;

        // Ürünü getir
        var product = await _context.Products
            .Where(p => p.Id == productId && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            throw new InvalidOperationException("Ürün bulunamadı");

        // FIFO: En eski katmanlardan başla
        var layers = await _context.StockLayers
            .Where(l => l.ProductId == productId
                     && l.CompanyId == companyId
                     && l.RemainingQuantity > 0)
            .OrderBy(l => l.EntryDate)
            .ThenBy(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        decimal remainingToConsume = quantity;
        decimal totalCost = 0;

        foreach (var layer in layers)
        {
            if (remainingToConsume <= 0)
                break;

            var consumeFromThisLayer = Math.Min(remainingToConsume, layer.RemainingQuantity);

            // Consumption kaydı oluştur
            var consumption = new StockConsumption
            {
                Id = Guid.NewGuid(),
                StockLayerId = layer.Id,
                ConsumptionDate = DateTime.UtcNow,
                ReferenceType = referenceType,
                ReferenceId = referenceId,
                Quantity = consumeFromThisLayer,
                UnitCost = layer.UnitCostInBase,
                TotalCost = consumeFromThisLayer * layer.UnitCostInBase,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.StockConsumptions.Add(consumption);

            // Layer'ı güncelle
            layer.RemainingQuantity -= consumeFromThisLayer;
            layer.UpdatedAt = DateTime.UtcNow;
            layer.UpdatedBy = userId;

            totalCost += consumption.TotalCost;
            remainingToConsume -= consumeFromThisLayer;

            _logger.LogDebug(
                "FIFO consumption: Layer={LayerId}, Consumed={Quantity}, Remaining={Remaining}",
                layer.Id, consumeFromThisLayer, layer.RemainingQuantity);
        }

        // Yetersiz stok kontrolü
        if (remainingToConsume > 0)
        {
            throw new InvalidOperationException(
                $"Yetersiz stok! İstenen: {quantity}, Mevcut: {quantity - remainingToConsume}");
        }

        // Stok hareketi kaydet
        var currentBalance = await CalculateStockQuantityAsync(productId, cancellationToken);
        var newBalance = currentBalance - quantity;

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            ProductId = productId,
            MovementDate = DateTime.UtcNow,
            Type = referenceType == "Sales" ? StockMovementType.Sales : StockMovementType.Transfer,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            Quantity = -quantity, // Negatif (çıkış)
            UnitCost = totalCost / quantity, // Ortalama maliyet
            TotalCost = totalCost,
            BalanceAfter = newBalance,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.StockMovements.Add(movement);

        // Product.StockQuantity güncelle
        product.StockQuantity = newBalance;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Stock removed (FIFO): Product={ProductId}, Quantity={Quantity}, TotalCost={Cost}, NewBalance={Balance}",
            productId, quantity, totalCost, newBalance);

        return totalCost; // FIFO maliyetini döndür
    }

    /// <summary>
    /// Ürünün toplam stok miktarını hesapla (tüm layer'ların toplamı)
    /// </summary>
    public async Task<decimal> CalculateStockQuantityAsync(
        Guid productId,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return 0;

        var companyId = _currentUser.CompanyId.Value;

        var totalQuantity = await _context.StockLayers
            .Where(l => l.ProductId == productId && l.CompanyId == companyId)
            .SumAsync(l => l.RemainingQuantity, cancellationToken);

        return totalQuantity;
    }

    /// <summary>
    /// FIFO maliyeti hesapla (satış fiyatı belirlerken kullanılır)
    /// </summary>
    public async Task<decimal> CalculateFifoCostAsync(
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            throw new UnauthorizedAccessException("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // FIFO: En eski katmanlardan başla
        var layers = await _context.StockLayers
            .Where(l => l.ProductId == productId
                     && l.CompanyId == companyId
                     && l.RemainingQuantity > 0)
            .OrderBy(l => l.EntryDate)
            .ThenBy(l => l.CreatedAt)
            .ToListAsync(cancellationToken);

        decimal remainingToCalculate = quantity;
        decimal totalCost = 0;

        foreach (var layer in layers)
        {
            if (remainingToCalculate <= 0)
                break;

            var useFromThisLayer = Math.Min(remainingToCalculate, layer.RemainingQuantity);
            totalCost += useFromThisLayer * layer.UnitCostInBase;
            remainingToCalculate -= useFromThisLayer;
        }

        if (remainingToCalculate > 0)
        {
            throw new InvalidOperationException(
                $"FIFO maliyet hesaplanamıyor: Yetersiz stok! İstenen: {quantity}, Mevcut: {quantity - remainingToCalculate}");
        }

        return totalCost;
    }
}

