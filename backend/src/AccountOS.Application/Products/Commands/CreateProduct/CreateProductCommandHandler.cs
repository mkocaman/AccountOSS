using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Products.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Products.Commands.CreateProduct;

/// <summary>
/// Ürün oluşturma komut işleyicisi
/// </summary>
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateProductCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<ProductDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Aynı isimde ürün var mı?
        var existingProduct = await _context.Products
            .Where(p => p.CompanyId == companyId && p.Name.ToLower() == request.Name.ToLower())
            .FirstOrDefaultAsync(cancellationToken);

        if (existingProduct != null)
            return Result<ProductDto>.Fail($"'{request.Name}' adında bir ürün zaten mevcut");

        // Barkod kontrolü
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var existingBarcode = await _context.Products
                .Where(p => p.CompanyId == companyId && p.Barcode == request.Barcode)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingBarcode != null)
                return Result<ProductDto>.Fail($"'{request.Barcode}' barkodu zaten kullanılıyor");
        }

        // Otomatik kod oluştur (P-0001, P-0002, vb.)
        var lastProduct = await _context.Products
            .Where(p => p.CompanyId == companyId)
            .OrderByDescending(p => p.Code)
            .FirstOrDefaultAsync(cancellationToken);

        var nextNumber = 1;
        if (lastProduct != null && lastProduct.Code.StartsWith("P-"))
        {
            var lastNumber = lastProduct.Code.Substring(2);
            if (int.TryParse(lastNumber, out var parsed))
                nextNumber = parsed + 1;
        }

        var code = $"P-{nextNumber:D4}"; // P-0001, P-0002, ...

        // Yeni ürün oluştur
        var product = new Product
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Code = code,
            Barcode = request.Barcode,
            Type = request.Type,
            Name = request.Name,
            Description = request.Description,
            PurchasePrice = request.PurchasePrice,
            SalePrice = request.SalePrice,
            Currency = request.Currency,
            VatRate = request.VatRate,
            Unit = request.Unit,
            TrackStock = request.Type == ProductType.Goods && request.TrackStock,
            MinStockLevel = request.MinStockLevel,
            StockQuantity = 0, // Başlangıçta 0, stok hareketleriyle artacak
            ImageUrl = request.ImageUrl,
            IsActive = true,
            IsForSale = true,
            IsForPurchase = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Products.Add(product);

        // Çevirileri ekle
        if (request.Translations != null && request.Translations.Any())
        {
            foreach (var translation in request.Translations)
            {
                var productTranslation = new ProductTranslation
                {
                    Id = Guid.NewGuid(),
                    ProductId = product.Id,
                    LanguageCode = translation.LanguageCode.ToUpper(),
                    Name = translation.Name,
                    Description = translation.Description
                };

                _context.ProductTranslations.Add(productTranslation);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = await MapToDtoAsync(product.Id, cancellationToken);

        return Result<ProductDto>.Ok(dto!);
    }

    private async Task<ProductDto?> MapToDtoAsync(Guid productId, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Translations)
            .Where(p => p.Id == productId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return null;

        var stockStatus = product.TrackStock
            ? product.StockQuantity <= product.MinStockLevel
                ? "Low Stock"
                : "In Stock"
            : "N/A";

        return new ProductDto
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
    }
}

