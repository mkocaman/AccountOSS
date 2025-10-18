using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Stock.Commands.AddStock;

/// <summary>
/// Stok ekleme komut işleyicisi
/// </summary>
public class AddStockCommandHandler : IRequestHandler<AddStockCommand, Result<decimal>>
{
    private readonly IStockService _stockService;

    public AddStockCommandHandler(IStockService stockService)
    {
        _stockService = stockService;
    }

    public async Task<Result<decimal>> Handle(AddStockCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var referenceId = request.ReferenceId ?? Guid.NewGuid();

            var newBalance = await _stockService.AddStockAsync(
                request.ProductId,
                request.Quantity,
                request.UnitCost,
                request.Currency,
                request.ReferenceType,
                referenceId,
                cancellationToken);

            return Result<decimal>.Ok(newBalance);
        }
        catch (InvalidOperationException ex)
        {
            return Result<decimal>.Fail(ex.Message);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Result<decimal>.Fail(ex.Message);
        }
    }
}

