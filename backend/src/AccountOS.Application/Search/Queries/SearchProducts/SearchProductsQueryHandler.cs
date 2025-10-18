using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Products.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchProducts;

public class SearchProductsQueryHandler 
    : IRequestHandler<SearchProductsQuery, Result<List<ProductDto>>>
{
    private readonly ISearchService _searchService;

    public SearchProductsQueryHandler(ISearchService searchService)
    {
        _searchService = searchService;
    }

    public async Task<Result<List<ProductDto>>> Handle(
        SearchProductsQuery request, 
        CancellationToken cancellationToken)
    {
        var results = await _searchService.SearchProductsAsync(
            request.Filter, 
            cancellationToken);

        return Result<List<ProductDto>>.Ok(results);
    }
}

