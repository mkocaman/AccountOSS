using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Currencies.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Currencies.Commands.CreateCurrency;

/// <summary>
/// Para birimi oluşturma komut işleyicisi
/// </summary>
public class CreateCurrencyCommandHandler : IRequestHandler<CreateCurrencyCommand, Result<CurrencyDto>>
{
    private readonly IApplicationDbContext _context;

    public CreateCurrencyCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CurrencyDto>> Handle(CreateCurrencyCommand request, CancellationToken cancellationToken)
    {
        // Aynı kodda para birimi var mı?
        var existingCurrency = await _context.Currencies
            .Where(c => c.Code.ToUpper() == request.Code.ToUpper())
            .FirstOrDefaultAsync(cancellationToken);

        if (existingCurrency != null)
            return Result<CurrencyDto>.Fail($"Para birimi kodu '{request.Code}' zaten mevcut");

        // Yeni para birimi oluştur
        var currency = new Currency
        {
            Id = Guid.NewGuid(),
            Code = request.Code.ToUpper(),
            Name = request.Name,
            Symbol = request.Symbol,
            DecimalPlaces = request.DecimalPlaces,
            DisplayOrder = request.DisplayOrder,
            IsActive = true
        };

        _context.Currencies.Add(currency);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CurrencyDto
        {
            Id = currency.Id,
            Code = currency.Code,
            Name = currency.Name,
            Symbol = currency.Symbol,
            DecimalPlaces = currency.DecimalPlaces,
            DisplayOrder = currency.DisplayOrder,
            IsActive = currency.IsActive
        };

        return Result<CurrencyDto>.Ok(dto);
    }
}

