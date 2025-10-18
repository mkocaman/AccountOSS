using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Queries.GetTaxRateById;

public class GetTaxRateByIdQueryHandler 
    : IRequestHandler<GetTaxRateByIdQuery, Result<TaxRateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetTaxRateByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxRateDto>> Handle(
        GetTaxRateByIdQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<TaxRateDto>.Fail("Şirket bilgisi bulunamadı");

        var taxRate = await _context.TaxRates
            .Where(t => t.Id == request.TaxRateId && t.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (taxRate == null)
            return Result<TaxRateDto>.Fail("Vergi oranı bulunamadı");

        var dto = new TaxRateDto
        {
            Id = taxRate.Id,
            TaxType = taxRate.TaxType,
            TaxTypeName = GetTaxTypeName(taxRate.TaxType),
            Name = taxRate.Name,
            Code = taxRate.Code,
            Rate = taxRate.Rate,
            EffectiveFrom = taxRate.EffectiveFrom,
            EffectiveTo = taxRate.EffectiveTo,
            CountryCode = taxRate.CountryCode,
            IsDefault = taxRate.IsDefault,
            IsActive = taxRate.IsActive
        };

        return Result<TaxRateDto>.Ok(dto);
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

