using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Search.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.GlobalSearch;

public class GlobalSearchQueryHandler 
    : IRequestHandler<GlobalSearchQuery, Result<SearchResultsDto>>
{
    private readonly ISearchService _searchService;

    public GlobalSearchQueryHandler(ISearchService searchService)
    {
        _searchService = searchService;
    }

    public async Task<Result<SearchResultsDto>> Handle(
        GlobalSearchQuery request, 
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SearchText) || request.SearchText.Length < 2)
            return Result<SearchResultsDto>.Fail("En az 2 karakter giriniz");

        var results = await _searchService.GlobalSearchAsync(
            request.SearchText, 
            request.PageSize, 
            cancellationToken);

        return Result<SearchResultsDto>.Ok(results);
    }
}

