using AccountOS.Application.Stock.Commands.AddStock;
using AccountOS.Application.Stock.Commands.RemoveStock;
using AccountOS.Application.Stock.Queries.GetStockLayers;
using AccountOS.Application.Stock.Queries.GetStockMovements;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Stok yönetimi (FIFO)
/// </summary>
[Authorize]
public class StockController : BaseApiController
{
    /// <summary>
    /// Stok katmanlarını listele
    /// </summary>
    /// <param name="productId">Ürün ID (opsiyonel)</param>
    /// <param name="activeOnly">Sadece aktif katmanlar</param>
    /// <returns>Stok katmanları listesi</returns>
    [HttpGet("layers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStockLayers(
        [FromQuery] Guid? productId = null,
        [FromQuery] bool activeOnly = true)
    {
        var result = await Mediator.Send(new GetStockLayersQuery
        {
            ProductId = productId,
            ActiveOnly = activeOnly
        });

        return FromResult(result);
    }

    /// <summary>
    /// Stok hareketlerini listele
    /// </summary>
    /// <param name="productId">Ürün ID (opsiyonel)</param>
    /// <param name="startDate">Başlangıç tarihi</param>
    /// <param name="endDate">Bitiş tarihi</param>
    /// <returns>Stok hareketleri listesi</returns>
    [HttpGet("movements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStockMovements(
        [FromQuery] Guid? productId = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        var result = await Mediator.Send(new GetStockMovementsQuery
        {
            ProductId = productId,
            StartDate = startDate,
            EndDate = endDate
        });

        return FromResult(result);
    }

    /// <summary>
    /// Stok ekle (Purchase, Return, Adjustment)
    /// </summary>
    /// <param name="command">Stok ekleme bilgileri</param>
    /// <returns>İşlem sonrası stok miktarı</returns>
    [HttpPost("add")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AddStock([FromBody] AddStockCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Stok çıkar (Sales, Transfer) - FIFO ile
    /// </summary>
    /// <param name="command">Stok çıkarma bilgileri</param>
    /// <returns>FIFO maliyeti</returns>
    [HttpPost("remove")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RemoveStock([FromBody] RemoveStockCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }
}

