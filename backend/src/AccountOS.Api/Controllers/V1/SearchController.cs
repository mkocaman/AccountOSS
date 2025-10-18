using AccountOS.Api.Controllers;
using AccountOS.Application.Search.Queries.GlobalSearch;
using AccountOS.Application.Search.Queries.SearchCustomers;
using AccountOS.Application.Search.Queries.SearchInvoices;
using AccountOS.Application.Search.Queries.SearchProducts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Arama servisi - Global ve gelişmiş arama
/// </summary>
[Authorize]
public class SearchController : BaseApiController
{
    /// <summary>
    /// Global arama - tüm tablolarda ara
    /// </summary>
    [HttpGet("global")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<AccountOS.Application.Search.Common.SearchResultsDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GlobalSearch([FromQuery] string q, [FromQuery] int limit = 10)
    {
        var result = await Mediator.Send(new GlobalSearchQuery
        {
            SearchText = q,
            PageSize = limit
        });

        return Ok(result);
    }

    /// <summary>
    /// Gelişmiş fatura arama
    /// </summary>
    [HttpPost("invoices")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Invoices.Common.InvoiceDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchInvoices([FromBody] AccountOS.Application.Search.Common.InvoiceSearchFilter filter)
    {
        var result = await Mediator.Send(new SearchInvoicesQuery
        {
            Filter = filter
        });

        return Ok(result);
    }

    /// <summary>
    /// Gelişmiş müşteri arama
    /// </summary>
    [HttpPost("customers")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Customers.Common.CustomerDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchCustomers([FromBody] AccountOS.Application.Search.Common.CustomerSearchFilter filter)
    {
        var result = await Mediator.Send(new SearchCustomersQuery
        {
            Filter = filter
        });

        return Ok(result);
    }

    /// <summary>
    /// Gelişmiş ürün arama
    /// </summary>
    [HttpPost("products")]
    [ProducesResponseType(typeof(AccountOS.Application.Common.Result<List<AccountOS.Application.Products.Common.ProductDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchProducts([FromBody] AccountOS.Application.Search.Common.ProductSearchFilter filter)
    {
        var result = await Mediator.Send(new SearchProductsQuery
        {
            Filter = filter
        });

        return Ok(result);
    }
}

