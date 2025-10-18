using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Accounting.Commands.CreateTaxRate;

public record CreateTaxRateCommand : IRequest<Result<TaxRateDto>>
{
    public TaxType TaxType { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public decimal Rate { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string CountryCode { get; init; } = "TR";
    public bool IsDefault { get; init; }
    public string? Description { get; init; }
}

