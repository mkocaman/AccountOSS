using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Application.Products.Common;
using AccountOS.Application.Search.Common;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Arama servisi - Global ve gelişmiş arama implementation
/// </summary>
public class SearchService : ISearchService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<SearchService> _logger;

    public SearchService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILogger<SearchService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<SearchResultsDto> GlobalSearchAsync(
        string query, 
        int pageSize = 10, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.CompanyId == null)
                return new SearchResultsDto { Results = new(), TotalCount = 0 };

            var companyId = _currentUser.CompanyId.Value;
            var results = new List<SearchResultItemDto>();

            // Faturalarda ara (en fazla 3 sonuç)
            var invoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId)
                .Where(i => EF.Functions.ILike(i.InvoiceNumber, $"%{query}%"))
                .OrderByDescending(i => i.InvoiceDate)
                .Take(3)
                .Select(i => new SearchResultItemDto
                {
                    Type = "Invoice",
                    Id = i.Id,
                    Title = i.InvoiceNumber,
                    Subtitle = $"{i.GrandTotal:N2} {i.Currency}",
                    Url = $"/invoices/{i.Id}",
                    Relevance = 1.0m
                })
                .ToListAsync(cancellationToken);
            results.AddRange(invoices);

            // Müşterilerde ara (en fazla 3 sonuç)
            var customers = await _context.Customers
                .Where(c => c.CompanyId == companyId)
                .Where(c => EF.Functions.ILike(c.Name, $"%{query}%") 
                         || EF.Functions.ILike(c.Code, $"%{query}%")
                         || (c.Email != null && EF.Functions.ILike(c.Email, $"%{query}%")))
                .OrderBy(c => c.Name)
                .Take(3)
                .Select(c => new SearchResultItemDto
                {
                    Type = "Customer",
                    Id = c.Id,
                    Title = c.Name,
                    Subtitle = c.Code,
                    Url = $"/customers/{c.Id}",
                    Relevance = 0.9m
                })
                .ToListAsync(cancellationToken);
            results.AddRange(customers);

            // Ürünlerde ara (en fazla 3 sonuç)
            var products = await _context.Products
                .Where(p => p.CompanyId == companyId)
                .Where(p => EF.Functions.ILike(p.Name, $"%{query}%") 
                         || EF.Functions.ILike(p.Code, $"%{query}%")
                         || (p.Barcode != null && EF.Functions.ILike(p.Barcode, $"%{query}%")))
                .OrderBy(p => p.Name)
                .Take(3)
                .Select(p => new SearchResultItemDto
                {
                    Type = "Product",
                    Id = p.Id,
                    Title = p.Name,
                    Subtitle = $"{p.Code} - Fiyat: {p.SalePrice:N2}",
                    Url = $"/products/{p.Id}",
                    Relevance = 0.8m
                })
                .ToListAsync(cancellationToken);
            results.AddRange(products);

            return new SearchResultsDto
            {
                Results = results
                    .OrderByDescending(r => r.Relevance)
                    .Take(pageSize)
                    .ToList(),
                TotalCount = results.Count
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Global search error for query: {Query}", query);
            return new SearchResultsDto { Results = new(), TotalCount = 0 };
        }
    }

    public async Task<List<InvoiceDto>> SearchInvoicesAsync(
        InvoiceSearchFilter filter, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.CompanyId == null)
                return new List<InvoiceDto>();

            var companyId = _currentUser.CompanyId.Value;

            var query = _context.Invoices
                .Where(i => i.CompanyId == companyId)
                .Include(i => i.Customer)
                .AsQueryable();

            // Metin araması
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(i => 
                    EF.Functions.ILike(i.InvoiceNumber, $"%{filter.SearchText}%") ||
                    EF.Functions.ILike(i.Customer.Name, $"%{filter.SearchText}%"));
            }

            // Müşteri filtresi
            if (filter.CustomerId.HasValue)
                query = query.Where(i => i.CustomerId == filter.CustomerId.Value);

            // Tarih aralığı
            if (filter.StartDate.HasValue)
                query = query.Where(i => i.InvoiceDate >= filter.StartDate.Value);

            if (filter.EndDate.HasValue)
                query = query.Where(i => i.InvoiceDate <= filter.EndDate.Value);

            // Durum filtresi
            if (filter.Status.HasValue)
                query = query.Where(i => i.Status == filter.Status.Value);

            // Para birimi
            if (!string.IsNullOrWhiteSpace(filter.Currency))
                query = query.Where(i => i.Currency == filter.Currency);

            // Tutar aralığı
            if (filter.MinAmount.HasValue)
                query = query.Where(i => i.GrandTotal >= filter.MinAmount.Value);

            if (filter.MaxAmount.HasValue)
                query = query.Where(i => i.GrandTotal <= filter.MaxAmount.Value);

            // Sıralama
            query = filter.SortBy?.ToLower() switch
            {
                "date" => filter.SortDescending ? 
                    query.OrderByDescending(i => i.InvoiceDate) : 
                    query.OrderBy(i => i.InvoiceDate),
                "amount" => filter.SortDescending ? 
                    query.OrderByDescending(i => i.GrandTotal) : 
                    query.OrderBy(i => i.GrandTotal),
                "customer" => filter.SortDescending ? 
                    query.OrderByDescending(i => i.Customer.Name) : 
                    query.OrderBy(i => i.Customer.Name),
                _ => query.OrderByDescending(i => i.InvoiceDate)
            };

            // Sayfalama
            var invoices = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(i => new InvoiceDto
                {
                    Id = i.Id,
                    InvoiceNumber = i.InvoiceNumber,
                    InvoiceDate = i.InvoiceDate,
                    DueDate = i.DueDate,
                    CustomerId = i.CustomerId,
                    CustomerName = i.Customer.Name,
                    Status = i.Status,
                    Currency = i.Currency,
                    SubTotal = i.SubTotal,
                    VatTotal = i.VatTotal,
                    GrandTotal = i.GrandTotal,
                    CreatedAt = i.CreatedAt
                })
                .ToListAsync(cancellationToken);

            return invoices;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Invoice search error");
            return new List<InvoiceDto>();
        }
    }

    public async Task<List<CustomerDto>> SearchCustomersAsync(
        CustomerSearchFilter filter, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.CompanyId == null)
                return new List<CustomerDto>();

            var companyId = _currentUser.CompanyId.Value;

            var query = _context.Customers
                .Where(c => c.CompanyId == companyId)
                .AsQueryable();

            // Metin araması
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(c => 
                    EF.Functions.ILike(c.Name, $"%{filter.SearchText}%") ||
                    EF.Functions.ILike(c.Code, $"%{filter.SearchText}%") ||
                    (c.Email != null && EF.Functions.ILike(c.Email, $"%{filter.SearchText}%")) ||
                    (c.Phone != null && EF.Functions.ILike(c.Phone, $"%{filter.SearchText}%")));
            }

            // Vergi numarası
            if (!string.IsNullOrWhiteSpace(filter.TaxNumber))
                query = query.Where(c => c.TaxNumber != null && EF.Functions.ILike(c.TaxNumber, $"%{filter.TaxNumber}%"));

            // Aktif durum
            if (filter.IsActive.HasValue)
                query = query.Where(c => c.IsActive == filter.IsActive.Value);

            // Sıralama
            query = filter.SortBy?.ToLower() switch
            {
                "name" => filter.SortDescending ? 
                    query.OrderByDescending(c => c.Name) : 
                    query.OrderBy(c => c.Name),
                "code" => filter.SortDescending ? 
                    query.OrderByDescending(c => c.Code) : 
                    query.OrderBy(c => c.Code),
                _ => query.OrderBy(c => c.Name)
            };

            // Sayfalama
            var customers = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(c => new CustomerDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Name = c.Name,
                    TaxNumber = c.TaxNumber,
                    TaxOffice = c.TaxOffice,
                    Email = c.Email,
                    Phone = c.Phone,
                    IsActive = c.IsActive
                })
                .ToListAsync(cancellationToken);

            return customers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Customer search error");
            return new List<CustomerDto>();
        }
    }

    public async Task<List<ProductDto>> SearchProductsAsync(
        ProductSearchFilter filter, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.CompanyId == null)
                return new List<ProductDto>();

            var companyId = _currentUser.CompanyId.Value;

            var query = _context.Products
                .Where(p => p.CompanyId == companyId)
                .AsQueryable();

            // Metin araması
            if (!string.IsNullOrWhiteSpace(filter.SearchText))
            {
                query = query.Where(p => 
                    EF.Functions.ILike(p.Name, $"%{filter.SearchText}%") ||
                    EF.Functions.ILike(p.Code, $"%{filter.SearchText}%") ||
                    (p.Barcode != null && EF.Functions.ILike(p.Barcode, $"%{filter.SearchText}%")) ||
                    (p.Description != null && EF.Functions.ILike(p.Description, $"%{filter.SearchText}%")));
            }

            // Fiyat aralığı
            if (filter.MinPrice.HasValue)
                query = query.Where(p => p.SalePrice >= filter.MinPrice.Value);

            if (filter.MaxPrice.HasValue)
                query = query.Where(p => p.SalePrice <= filter.MaxPrice.Value);

            // Stokta var mı?
            if (filter.InStock.HasValue)
            {
                if (filter.InStock.Value)
                    query = query.Where(p => p.StockQuantity > 0);
                else
                    query = query.Where(p => p.StockQuantity <= 0);
            }

            // Aktif durum
            if (filter.IsActive.HasValue)
                query = query.Where(p => p.IsActive == filter.IsActive.Value);

            // Sıralama
            query = filter.SortBy?.ToLower() switch
            {
                "name" => filter.SortDescending ? 
                    query.OrderByDescending(p => p.Name) : 
                    query.OrderBy(p => p.Name),
                "code" => filter.SortDescending ? 
                    query.OrderByDescending(p => p.Code) : 
                    query.OrderBy(p => p.Code),
                "price" => filter.SortDescending ? 
                    query.OrderByDescending(p => p.SalePrice) : 
                    query.OrderBy(p => p.SalePrice),
                "stock" => filter.SortDescending ? 
                    query.OrderByDescending(p => p.StockQuantity) : 
                    query.OrderBy(p => p.StockQuantity),
                _ => query.OrderBy(p => p.Name)
            };

            // Sayfalama
            var products = await query
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Code = p.Code,
                    Name = p.Name,
                    Description = p.Description,
                    Barcode = p.Barcode,
                    Unit = p.Unit,
                    PurchasePrice = p.PurchasePrice,
                    SalePrice = p.SalePrice,
                    VatRate = p.VatRate,
                    StockQuantity = p.StockQuantity,
                    IsActive = p.IsActive
                })
                .ToListAsync(cancellationToken);

            return products;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Product search error");
            return new List<ProductDto>();
        }
    }
}

