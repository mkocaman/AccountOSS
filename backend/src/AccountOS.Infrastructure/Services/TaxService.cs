using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Vergi hesaplama servisi implementation
/// </summary>
public class TaxService : ITaxService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<TaxService> _logger;

    public TaxService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILogger<TaxService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<(decimal TaxAmount, decimal TaxBase, decimal Rate)> CalculateVatAsync(
        decimal amount,
        bool includesVat,
        decimal? vatRate = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Get VAT rate
            var rate = vatRate ?? await GetActiveTaxRateAsync(TaxType.Vat, DateTime.UtcNow, cancellationToken);

            decimal taxBase;
            decimal taxAmount;

            if (includesVat)
            {
                // Amount includes VAT - extract it
                taxBase = amount / (1 + (rate / 100));
                taxAmount = amount - taxBase;
            }
            else
            {
                // Amount excludes VAT - add it
                taxBase = amount;
                taxAmount = amount * (rate / 100);
            }

            return (Math.Round(taxAmount, 2), Math.Round(taxBase, 2), rate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating VAT");
            throw;
        }
    }

    public async Task<(decimal WithholdingAmount, decimal Rate)> CalculateWithholdingTaxAsync(
        decimal amount,
        TaxType withholdingType,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var rate = await GetActiveTaxRateAsync(withholdingType, DateTime.UtcNow, cancellationToken);
            var withholdingAmount = amount * (rate / 100);

            return (Math.Round(withholdingAmount, 2), rate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating withholding tax");
            throw;
        }
    }

    public async Task SaveTaxCalculationAsync(
        string entityType,
        Guid entityId,
        TaxType taxType,
        decimal taxBase,
        decimal rate,
        decimal taxAmount,
        string currency,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.CompanyId == null)
                return;

            // Get tax rate entity
            var taxRate = await _context.TaxRates
                .Where(t => t.CompanyId == _currentUser.CompanyId.Value
                         && t.TaxType == taxType
                         && t.Rate == rate
                         && t.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            if (taxRate == null)
            {
                _logger.LogWarning("Tax rate not found for type {TaxType}, rate {Rate}", taxType, rate);
                return;
            }

            var taxCalculation = new TaxCalculation
            {
                Id = Guid.NewGuid(),
                CompanyId = _currentUser.CompanyId.Value,
                EntityType = entityType,
                EntityId = entityId,
                TaxType = taxType,
                TaxRateId = taxRate.Id,
                TaxBase = taxBase,
                Rate = rate,
                TaxAmount = taxAmount,
                Currency = currency,
                CalculationDate = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser.UserId ?? Guid.Empty
            };

            _context.TaxCalculations.Add(taxCalculation);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving tax calculation");
        }
    }

    public async Task<decimal> GetActiveTaxRateAsync(
        TaxType taxType,
        DateTime effectiveDate,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return 0;

        var taxRate = await _context.TaxRates
            .Where(t => t.CompanyId == _currentUser.CompanyId.Value
                     && t.TaxType == taxType
                     && t.IsActive
                     && t.EffectiveFrom <= effectiveDate
                     && (t.EffectiveTo == null || t.EffectiveTo >= effectiveDate))
            .OrderByDescending(t => t.IsDefault)
            .ThenByDescending(t => t.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        return taxRate?.Rate ?? 0;
    }
}

