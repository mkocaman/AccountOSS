using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Ürün güncelleme komut işleyicisi
/// </summary>
public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateProductCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<ProductDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Ürün var mı?
        var product = await _context.Products
            .Include(p => p.Translations)
            .Where(p => p.Id == request.Id && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return Result<ProductDto>.Fail("Ürün bulunamadı");

        // Aynı isimde başka ürün var mı?
        if (request.Name != product.Name)
        {
            var existingProduct = await _context.Products
                .Where(p => p.CompanyId == companyId
                         && p.Name.ToLower() == request.Name.ToLower()
                         && p.Id != request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingProduct != null)
                return Result<ProductDto>.Fail($"'{request.Name}' adında bir ürün zaten mevcut");
        }

        // Barkod kontrolü
        if (!string.IsNullOrWhiteSpace(request.Barcode) && request.Barcode != product.Barcode)
        {
            var existingBarcode = await _context.Products
                .Where(p => p.CompanyId == companyId && p.Barcode == request.Barcode && p.Id != request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingBarcode != null)
                return Result<ProductDto>.Fail($"'{request.Barcode}' barkodu zaten kullanılıyor");
        }

        // Güncelle
        product.Name = request.Name;
        product.Description = request.Description;
        product.Type = request.Type;
        product.Barcode = request.Barcode;
        product.PurchasePrice = request.PurchasePrice;
        product.SalePrice = request.SalePrice;
        
        if (!string.IsNullOrWhiteSpace(request.Currency))
            product.Currency = request.Currency;
        
        product.VatRate = request.VatRate;
        
        if (!string.IsNullOrWhiteSpace(request.Unit))
            product.Unit = request.Unit;
        
        product.TrackStock = request.Type == ProductType.Goods && request.TrackStock;
        product.MinStockLevel = request.MinStockLevel;
        product.ImageUrl = request.ImageUrl;
        product.UpdatedAt = DateTime.UtcNow;
        product.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
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

