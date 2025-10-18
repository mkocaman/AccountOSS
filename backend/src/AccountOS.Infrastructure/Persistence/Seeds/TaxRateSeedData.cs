using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;

namespace AccountOS.Infrastructure.Persistence.Seeds;

/// <summary>
/// Standart Türkiye vergi oranları
/// </summary>
public static class TaxRateSeedData
{
    public static List<TaxRate> GetStandardTaxRates(Guid companyId, Guid createdBy)
    {
        var taxRates = new List<TaxRate>();
        var now = DateTime.UtcNow;
        var effectiveFrom = new DateTime(2024, 1, 1);

        // KDV Oranları (Türkiye)
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.Vat, "KDV20", "KDV %20", 20m, effectiveFrom, true));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.Vat, "KDV10", "KDV %10", 10m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.Vat, "KDV1", "KDV %1", 1m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.Vat, "KDV0", "KDV %0 (İstisna)", 0m, effectiveFrom, false));

        // Gelir Vergisi Stopajı
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.WithholdingIncomeTax, "GVS20", "Gelir Vergisi Stopajı %20", 20m, effectiveFrom, true));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.WithholdingIncomeTax, "GVS15", "Gelir Vergisi Stopajı %15", 15m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.WithholdingIncomeTax, "GVS10", "Gelir Vergisi Stopajı %10", 10m, effectiveFrom, false));

        // KDV Stopajı
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.WithholdingVat, "KDVS90", "KDV Stopajı %90", 90m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.WithholdingVat, "KDVS50", "KDV Stopajı %50", 50m, effectiveFrom, false));

        // Damga Vergisi
        taxRates.Add(CreateTaxRate(companyId, createdBy, now, TaxType.StampDuty, "DV0.948", "Damga Vergisi %0.948", 0.948m, effectiveFrom, true));

        return taxRates;
    }

    private static TaxRate CreateTaxRate(
        Guid companyId,
        Guid createdBy,
        DateTime now,
        TaxType taxType,
        string code,
        string name,
        decimal rate,
        DateTime effectiveFrom,
        bool isDefault)
    {
        return new TaxRate
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            TaxType = taxType,
            Name = name,
            Code = code,
            Rate = rate,
            EffectiveFrom = effectiveFrom,
            CountryCode = "TR",
            IsDefault = isDefault,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = createdBy
        };
    }
}

