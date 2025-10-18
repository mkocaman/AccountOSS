using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Queries.GetTaxRates;

public class GetTaxRatesQueryHandler 
    : IRequestHandler<GetTaxRatesQuery, Result<List<TaxRateDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetTaxRatesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<TaxRateDto>>> Handle(
        GetTaxRatesQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<TaxRateDto>>.Fail("Şirket bilgisi bulunamadı");

        var query = _context.TaxRates
            .Where(t => t.CompanyId == _currentUser.CompanyId.Value);

        // Filters
        if (request.TaxType.HasValue)
            query = query.Where(t => t.TaxType == request.TaxType.Value);

        if (request.IsActive.HasValue)
            query = query.Where(t => t.IsActive == request.IsActive.Value);

        if (request.EffectiveDate.HasValue)
        {
            var effectiveDate = request.EffectiveDate.Value;
            query = query.Where(t => t.EffectiveFrom <= effectiveDate 
                                  && (t.EffectiveTo == null || t.EffectiveTo >= effectiveDate));
        }

        var taxRates = await query
            .OrderBy(t => t.TaxType)
            .ThenByDescending(t => t.IsDefault)
            .ThenBy(t => t.Rate)
            .Select(t => new TaxRateDto
            {
                Id = t.Id,
                TaxType = t.TaxType,
                TaxTypeName = GetTaxTypeName(t.TaxType),
                Name = t.Name,
                Code = t.Code,
                Rate = t.Rate,
                EffectiveFrom = t.EffectiveFrom,
                EffectiveTo = t.EffectiveTo,
                CountryCode = t.CountryCode,
                IsDefault = t.IsDefault,
                IsActive = t.IsActive
            })
            .ToListAsync(cancellationToken);

        return Result<List<TaxRateDto>>.Ok(taxRates);
    }

    private static string GetTaxTypeName(TaxType type)
    {
        return type switch
        {
            TaxType.Vat => "KDV",
            TaxType.WithholdingIncomeTax => "Gelir Vergisi Stopajı",
            TaxType.WithholdingVat => "KDV Stopajı",
            TaxType.SpecialConsumptionTax => "ÖTV",
            TaxType.StampDuty => "Damga Vergisi",
            TaxType.BankingInsuranceTax => "BSMV",
            TaxType.CorporateTax => "Kurumlar Vergisi",
            TaxType.Other => "Diğer",
            _ => type.ToString()
        };
    }
}

