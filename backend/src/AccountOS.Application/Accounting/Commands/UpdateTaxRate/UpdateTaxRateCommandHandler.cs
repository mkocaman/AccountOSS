using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Commands.UpdateTaxRate;

public class UpdateTaxRateCommandHandler 
    : IRequestHandler<UpdateTaxRateCommand, Result<TaxRateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateTaxRateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxRateDto>> Handle(
        UpdateTaxRateCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<TaxRateDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId.Value;

        var taxRate = await _context.TaxRates
            .Where(t => t.Id == request.Id && t.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (taxRate == null)
            return Result<TaxRateDto>.Fail("Vergi oranı bulunamadı");

        // Update only provided fields
        if (request.Name != null)
            taxRate.Name = request.Name;

        if (request.Rate.HasValue)
        {
            if (request.Rate.Value < 0 || request.Rate.Value > 100)
                return Result<TaxRateDto>.Fail("Vergi oranı 0 ile 100 arasında olmalıdır");
            
            taxRate.Rate = request.Rate.Value;
        }

        if (request.EffectiveFrom.HasValue)
            taxRate.EffectiveFrom = request.EffectiveFrom.Value;

        if (request.EffectiveTo.HasValue)
        {
            if (request.EffectiveTo.Value <= taxRate.EffectiveFrom)
                return Result<TaxRateDto>.Fail("Geçerlilik bitiş tarihi, başlangıç tarihinden sonra olmalıdır");
            
            taxRate.EffectiveTo = request.EffectiveTo.Value;
        }

        if (request.IsDefault.HasValue)
        {
            taxRate.IsDefault = request.IsDefault.Value;

            // If setting as default, unset other defaults of same type
            if (request.IsDefault.Value)
            {
                var otherDefaults = await _context.TaxRates
                    .Where(t => t.CompanyId == companyId 
                             && t.TaxType == taxRate.TaxType 
                             && t.IsDefault
                             && t.Id != taxRate.Id)
                    .ToListAsync(cancellationToken);

                foreach (var other in otherDefaults)
                {
                    other.IsDefault = false;
                    other.UpdatedAt = DateTime.UtcNow;
                    other.UpdatedBy = userId;
                }
            }
        }

        if (request.IsActive.HasValue)
            taxRate.IsActive = request.IsActive.Value;

        if (request.Description != null)
            taxRate.Description = request.Description;

        taxRate.UpdatedAt = DateTime.UtcNow;
        taxRate.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(taxRate);
        return Result<TaxRateDto>.Ok(dto);
    }

    private static TaxRateDto MapToDto(Domain.Entities.TaxRate taxRate)
    {
        return new TaxRateDto
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

