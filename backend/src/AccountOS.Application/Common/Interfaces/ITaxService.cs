using AccountOS.Domain.Enums;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Vergi hesaplama servisi
/// </summary>
public interface ITaxService
{
    /// <summary>
    /// KDV hesapla
    /// </summary>
    Task<(decimal TaxAmount, decimal TaxBase, decimal Rate)> CalculateVatAsync(
        decimal amount,
        bool includesVat,
        decimal? vatRate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stopaj hesapla
    /// </summary>
    Task<(decimal WithholdingAmount, decimal Rate)> CalculateWithholdingTaxAsync(
        decimal amount,
        TaxType withholdingType,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Vergi kaydı oluştur
    /// </summary>
    Task SaveTaxCalculationAsync(
        string entityType,
        Guid entityId,
        TaxType taxType,
        decimal taxBase,
        decimal rate,
        decimal taxAmount,
        string currency,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Aktif vergi oranını getir
    /// </summary>
    Task<decimal> GetActiveTaxRateAsync(
        TaxType taxType,
        DateTime effectiveDate,
        CancellationToken cancellationToken = default);
}

