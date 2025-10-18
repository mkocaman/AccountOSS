using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchInvoices;

public class SearchInvoicesQueryHandler 
    : IRequestHandler<SearchInvoicesQuery, Result<List<InvoiceDto>>>
{
    private readonly ISearchService _searchService;

    public SearchInvoicesQueryHandler(ISearchService searchService)
    {
        _searchService = searchService;
    }

    public async Task<Result<List<InvoiceDto>>> Handle(
        SearchInvoicesQuery request, 
        CancellationToken cancellationToken)
    {
        var results = await _searchService.SearchInvoicesAsync(
            request.Filter, 
            cancellationToken);

        return Result<List<InvoiceDto>>.Ok(results);
    }
}

