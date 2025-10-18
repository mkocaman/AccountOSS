using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Commands.UpdateTaxRate;

public record UpdateTaxRateCommand : IRequest<Result<TaxRateDto>>
{
    public Guid Id { get; init; }
    public string? Name { get; init; }
    public decimal? Rate { get; init; }
    public DateTime? EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public bool? IsDefault { get; init; }
    public bool? IsActive { get; init; }
    public string? Description { get; init; }
}

