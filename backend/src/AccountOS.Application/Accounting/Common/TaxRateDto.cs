using AccountOS.Domain.Enums;

namespace AccountOS.Application.Accounting.Common;

public record TaxRateDto
{
    public Guid Id { get; init; }
    public TaxType TaxType { get; init; }
    public string TaxTypeName { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public decimal Rate { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public string CountryCode { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
    public bool IsActive { get; init; }
}

