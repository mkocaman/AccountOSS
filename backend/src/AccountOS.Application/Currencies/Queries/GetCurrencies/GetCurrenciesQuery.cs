using AccountOS.Application.Common;
using AccountOS.Application.Currencies.Common;
using MediatR;

namespace AccountOS.Application.Currencies.Queries.GetCurrencies;

/// <summary>
/// Para birimlerini listele
/// </summary>
public record GetCurrenciesQuery : IRequest<Result<List<CurrencyDto>>>
{
    /// <summary>Sadece aktif para birimlerini getir</summary>
    public bool ActiveOnly { get; init; } = true;
}

