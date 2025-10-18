using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Commands.CreateTaxRate;

public class CreateTaxRateCommandHandler 
    : IRequestHandler<CreateTaxRateCommand, Result<TaxRateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateTaxRateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<TaxRateDto>> Handle(
        CreateTaxRateCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<TaxRateDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId.Value;

        // Validate: Code must be unique per company
        var existingCode = await _context.TaxRates
            .Where(t => t.CompanyId == companyId && t.Code == request.Code)
            .AnyAsync(cancellationToken);

        if (existingCode)
            return Result<TaxRateDto>.Fail($"Vergi kodu '{request.Code}' zaten kullanılıyor");

        // Validate: Rate must be between 0 and 100
        if (request.Rate < 0 || request.Rate > 100)
            return Result<TaxRateDto>.Fail("Vergi oranı 0 ile 100 arasında olmalıdır");

        // Validate: EffectiveTo must be after EffectiveFrom
        if (request.EffectiveTo.HasValue && request.EffectiveTo.Value <= request.EffectiveFrom)
            return Result<TaxRateDto>.Fail("Geçerlilik bitiş tarihi, başlangıç tarihinden sonra olmalıdır");

        // If this is set as default, unset other defaults of same type
        if (request.IsDefault)
        {
            var otherDefaults = await _context.TaxRates
                .Where(t => t.CompanyId == companyId 
                         && t.TaxType == request.TaxType 
                         && t.IsDefault)
                .ToListAsync(cancellationToken);

            foreach (var taxRate in otherDefaults)
            {
                taxRate.IsDefault = false;
                taxRate.UpdatedAt = DateTime.UtcNow;
                taxRate.UpdatedBy = userId;
            }
        }

        var newTaxRate = new TaxRate
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            TaxType = request.TaxType,
            Name = request.Name,
            Code = request.Code,
            Rate = request.Rate,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            CountryCode = request.CountryCode,
            IsDefault = request.IsDefault,
            IsActive = true,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.TaxRates.Add(newTaxRate);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(newTaxRate);
        return Result<TaxRateDto>.Ok(dto);
    }

    private static TaxRateDto MapToDto(TaxRate taxRate)
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

