using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Currencies.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Currencies.Commands.CreateFxRate;

/// <summary>
/// Döviz kuru oluşturma komut işleyicisi
/// </summary>
public class CreateFxRateCommandHandler : IRequestHandler<CreateFxRateCommand, Result<FxRateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateFxRateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<FxRateDto>> Handle(CreateFxRateCommand request, CancellationToken cancellationToken)
    {
        // Para birimleri mevcut mu?
        var baseCurrency = await _context.Currencies
            .Where(c => c.Code == request.BaseCurrencyCode.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (baseCurrency == null)
            return Result<FxRateDto>.Fail($"Baz para birimi '{request.BaseCurrencyCode}' bulunamadı");

        var quoteCurrency = await _context.Currencies
            .Where(c => c.Code == request.QuoteCurrencyCode.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (quoteCurrency == null)
            return Result<FxRateDto>.Fail($"Hedef para birimi '{request.QuoteCurrencyCode}' bulunamadı");

        // Aynı tarih için kur var mı? (güncelleme yapalım)
        var existingRate = await _context.FxRates
            .Where(f => f.BaseCurrencyCode == request.BaseCurrencyCode.ToUpper()
                     && f.QuoteCurrencyCode == request.QuoteCurrencyCode.ToUpper()
                     && f.EffectiveDate.Date == request.EffectiveDate.Date)
            .FirstOrDefaultAsync(cancellationToken);

        if (existingRate != null)
        {
            // Mevcut kuru güncelle
            existingRate.Rate = request.Rate;
            existingRate.Source = request.Source;
            existingRate.IsManual = request.Source == "Manual";
            existingRate.UpdatedAt = DateTime.UtcNow;
            existingRate.UpdatedBy = _currentUser.UserId ?? Guid.Empty;

            await _context.SaveChangesAsync(cancellationToken);

            return Result<FxRateDto>.Ok(new FxRateDto
            {
                Id = existingRate.Id,
                BaseCurrencyCode = existingRate.BaseCurrencyCode,
                QuoteCurrencyCode = existingRate.QuoteCurrencyCode,
                Rate = existingRate.Rate,
                EffectiveDate = existingRate.EffectiveDate,
                Source = existingRate.Source,
                IsManual = existingRate.IsManual,
                CreatedAt = existingRate.CreatedAt,
                CreatedBy = existingRate.CreatedBy
            });
        }

        // Yeni kur oluştur
        var fxRate = new FxRate
        {
            Id = Guid.NewGuid(),
            BaseCurrencyCode = request.BaseCurrencyCode.ToUpper(),
            QuoteCurrencyCode = request.QuoteCurrencyCode.ToUpper(),
            Rate = request.Rate,
            EffectiveDate = request.EffectiveDate.Date,
            Source = request.Source,
            IsManual = request.Source == "Manual",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.FxRates.Add(fxRate);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FxRateDto
        {
            Id = fxRate.Id,
            BaseCurrencyCode = fxRate.BaseCurrencyCode,
            QuoteCurrencyCode = fxRate.QuoteCurrencyCode,
            Rate = fxRate.Rate,
            EffectiveDate = fxRate.EffectiveDate,
            Source = fxRate.Source,
            IsManual = fxRate.IsManual,
            CreatedAt = fxRate.CreatedAt,
            CreatedBy = fxRate.CreatedBy
        };

        return Result<FxRateDto>.Ok(dto);
    }
}

