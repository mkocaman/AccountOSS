using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Products.Queries.GetProductById;

/// <summary>
/// Ürün detay sorgu işleyicisi
/// </summary>
public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetProductByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü (multi-tenant)
        if (_currentUser.CompanyId == null)
            return Result<ProductDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var product = await _context.Products
            .Include(p => p.Translations)
            .Where(p => p.Id == request.Id && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return Result<ProductDto>.Fail("Ürün bulunamadı");

        var stockStatus = product.TrackStock
            ? product.StockQuantity <= product.MinStockLevel ? "Low Stock" : "In Stock"
            : "N/A";

        var dto = new ProductDto
        {
            Id = product.Id,
            CompanyId = product.CompanyId,
            Code = product.Code,
            Barcode = product.Barcode,
            Type = product.Type,
            TypeName = product.Type == ProductType.Goods ? "Mal" : "Hizmet",
            Name = product.Name,
            Description = product.Description,
            PurchasePrice = product.PurchasePrice,
            SalePrice = product.SalePrice,
            Currency = product.Currency,
            VatRate = product.VatRate,
            Unit = product.Unit,
            TrackStock = product.TrackStock,
            MinStockLevel = product.MinStockLevel,
            StockQuantity = product.StockQuantity,
            StockStatus = stockStatus,
            IsActive = product.IsActive,
            IsForSale = product.IsForSale,
            IsForPurchase = product.IsForPurchase,
            ImageUrl = product.ImageUrl,
            Translations = product.Translations.Select(t => new ProductTranslationDto
            {
                Id = t.Id,
                LanguageCode = t.LanguageCode,
                Name = t.Name,
                Description = t.Description
            }).ToList(),
            CreatedAt = product.CreatedAt
        };

        return Result<ProductDto>.Ok(dto);
    }
}

