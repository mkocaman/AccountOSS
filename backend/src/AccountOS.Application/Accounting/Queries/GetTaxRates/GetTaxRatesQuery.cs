using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Accounting.Queries.GetTaxRates;

public record GetTaxRatesQuery : IRequest<Result<List<TaxRateDto>>>
{
    public TaxType? TaxType { get; init; }
    public bool? IsActive { get; init; }
    public DateTime? EffectiveDate { get; init; }
}

