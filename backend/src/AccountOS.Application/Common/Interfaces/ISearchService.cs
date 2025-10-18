using AccountOS.Application.Customers.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Application.Products.Common;
using AccountOS.Application.Search.Common;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Arama servisi - Global ve gelişmiş arama
/// </summary>
public interface ISearchService
{
    /// <summary>
    /// Global arama (tüm tablolarda)
    /// </summary>
    Task<SearchResultsDto> GlobalSearchAsync(
        string query, 
        int pageSize = 10, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gelişmiş fatura arama
    /// </summary>
    Task<List<InvoiceDto>> SearchInvoicesAsync(
        InvoiceSearchFilter filter, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gelişmiş müşteri arama
    /// </summary>
    Task<List<CustomerDto>> SearchCustomersAsync(
        CustomerSearchFilter filter, 
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gelişmiş ürün arama
    /// </summary>
    Task<List<ProductDto>> SearchProductsAsync(
        ProductSearchFilter filter, 
        CancellationToken cancellationToken = default);
}

