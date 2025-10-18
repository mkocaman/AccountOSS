using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Currencies.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Currencies.Queries.GetCurrencies;

/// <summary>
/// Para birimi listesi sorgu işleyicisi
/// </summary>
public class GetCurrenciesQueryHandler : IRequestHandler<GetCurrenciesQuery, Result<List<CurrencyDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCurrenciesQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<CurrencyDto>>> Handle(GetCurrenciesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Currencies.AsQueryable();

        if (request.ActiveOnly)
            query = query.Where(c => c.IsActive);

        var currencies = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Code)
            .Select(c => new CurrencyDto
            {
                Id = c.Id,
                Code = c.Code,
                Name = c.Name,
                Symbol = c.Symbol,
                DecimalPlaces = c.DecimalPlaces,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive
            })
            .ToListAsync(cancellationToken);

        return Result<List<CurrencyDto>>.Ok(currencies);
    }
}

