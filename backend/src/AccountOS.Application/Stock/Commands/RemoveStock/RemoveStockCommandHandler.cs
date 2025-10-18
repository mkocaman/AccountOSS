using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Stock.Commands.RemoveStock;

/// <summary>
/// Stok çıkarma komut işleyicisi
/// </summary>
public class RemoveStockCommandHandler : IRequestHandler<RemoveStockCommand, Result<decimal>>
{
    private readonly IStockService _stockService;

    public RemoveStockCommandHandler(IStockService stockService)
    {
        _stockService = stockService;
    }

    public async Task<Result<decimal>> Handle(RemoveStockCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var referenceId = request.ReferenceId ?? Guid.NewGuid();

            var fifoCost = await _stockService.RemoveStockAsync(
                request.ProductId,
                request.Quantity,
                request.ReferenceType,
                referenceId,
                cancellationToken);

            return Result<decimal>.Ok(fifoCost);
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

