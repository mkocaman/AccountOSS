using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchCustomers;

public class SearchCustomersQueryHandler 
    : IRequestHandler<SearchCustomersQuery, Result<List<CustomerDto>>>
{
    private readonly ISearchService _searchService;

    public SearchCustomersQueryHandler(ISearchService searchService)
    {
        _searchService = searchService;
    }

    public async Task<Result<List<CustomerDto>>> Handle(
        SearchCustomersQuery request, 
        CancellationToken cancellationToken)
    {
        var results = await _searchService.SearchCustomersAsync(
            request.Filter, 
            cancellationToken);

        return Result<List<CustomerDto>>.Ok(results);
    }
}

