using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Currencies.Queries.GetCurrentRate;

/// <summary>
/// Güncel kur getirme sorgu işleyicisi
/// </summary>
public class GetCurrentRateQueryHandler : IRequestHandler<GetCurrentRateQuery, Result<decimal>>
{
    private readonly IApplicationDbContext _context;

    public GetCurrentRateQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<decimal>> Handle(GetCurrentRateQuery request, CancellationToken cancellationToken)
    {
        // Aynı para birimi ise kur 1
        if (request.BaseCurrencyCode.ToUpper() == request.QuoteCurrencyCode.ToUpper())
            return Result<decimal>.Ok(1m);

        var targetDate = request.AsOfDate?.Date ?? DateTime.UtcNow.Date;

        // İlgili tarihte veya daha önce olan en yakın kuru bul
        var fxRate = await _context.FxRates
            .Where(f => f.BaseCurrencyCode == request.BaseCurrencyCode.ToUpper()
                     && f.QuoteCurrencyCode == request.QuoteCurrencyCode.ToUpper()
                     && f.EffectiveDate.Date <= targetDate)
            .OrderByDescending(f => f.EffectiveDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (fxRate == null)
            return Result<decimal>.Fail($"{request.BaseCurrencyCode}/{request.QuoteCurrencyCode} için kur bulunamadı");

        return Result<decimal>.Ok(fxRate.Rate);
    }
}

