using AccountOS.Application.Common;
using AccountOS.Application.Search.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.GlobalSearch;

/// <summary>
/// Global arama query (tüm tablolarda arama)
/// </summary>
public record GlobalSearchQuery : IRequest<Result<SearchResultsDto>>
{
    public string SearchText { get; init; } = string.Empty;
    public int PageSize { get; init; } = 10;
}

