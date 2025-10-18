using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Products.Queries.GetProducts;

/// <summary>
/// Ürün listesi sorgu işleyicisi
/// </summary>
public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<List<ProductDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProductsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ProductDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü (multi-tenant)
        if (_currentUser.CompanyId == null)
            return Result<List<ProductDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.Products
            .Include(p => p.Translations)
            .Where(p => p.CompanyId == companyId);

        // Aktif filtresi
        if (request.ActiveOnly)
            query = query.Where(p => p.IsActive);

        // Stok takibi filtresi
        if (request.TrackStockOnly.HasValue)
            query = query.Where(p => p.TrackStock == request.TrackStockOnly.Value);

        // Arama
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(searchTerm) ||
                p.Code.ToLower().Contains(searchTerm) ||
                (p.Barcode != null && p.Barcode.Contains(searchTerm)));
        }

        var products = await query
            .OrderBy(p => p.Name)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                CompanyId = p.CompanyId,
                Code = p.Code,
                Barcode = p.Barcode,
                Type = p.Type,
                TypeName = p.Type == ProductType.Goods ? "Mal" : "Hizmet",
                Name = p.Name,
                Description = p.Description,
                PurchasePrice = p.PurchasePrice,
                SalePrice = p.SalePrice,
                Currency = p.Currency,
                VatRate = p.VatRate,
                Unit = p.Unit,
                TrackStock = p.TrackStock,
                MinStockLevel = p.MinStockLevel,
                StockQuantity = p.StockQuantity,
                StockStatus = p.TrackStock
                    ? p.StockQuantity <= p.MinStockLevel ? "Low Stock" : "In Stock"
                    : "N/A",
                IsActive = p.IsActive,
                IsForSale = p.IsForSale,
                IsForPurchase = p.IsForPurchase,
                ImageUrl = p.ImageUrl,
                Translations = p.Translations.Select(t => new ProductTranslationDto
                {
                    Id = t.Id,
                    LanguageCode = t.LanguageCode,
                    Name = t.Name,
                    Description = t.Description
                }).ToList(),
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<ProductDto>>.Ok(products);
    }
}

