using AccountOS.Application.Products.Commands.CreateProduct;
using AccountOS.Application.Products.Commands.DeleteProduct;
using AccountOS.Application.Products.Commands.UpdateProduct;
using AccountOS.Application.Products.Queries.GetProductById;
using AccountOS.Application.Products.Queries.GetProducts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Ürün yönetimi
/// </summary>
[Authorize]
public class ProductsController : BaseApiController
{
    /// <summary>
    /// Ürünleri listele
    /// </summary>
    /// <param name="searchTerm">Arama terimi (ad, kod, barkod)</param>
    /// <param name="activeOnly">Sadece aktif ürünler</param>
    /// <param name="trackStockOnly">Sadece stok takipli ürünler</param>
    /// <returns>Ürün listesi</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool activeOnly = true,
        [FromQuery] bool? trackStockOnly = null)
    {
        var result = await Mediator.Send(new GetProductsQuery
        {
            SearchTerm = searchTerm,
            ActiveOnly = activeOnly,
            TrackStockOnly = trackStockOnly
        });

        return FromResult(result);
    }

    /// <summary>
    /// ID'ye göre ürün detayı getir
    /// </summary>
    /// <param name="id">Ürün ID</param>
    /// <returns>Ürün detayı</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var result = await Mediator.Send(new GetProductByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return FromResult(result);
    }

    /// <summary>
    /// Yeni ürün oluştur
    /// </summary>
    /// <param name="command">Ürün bilgileri</param>
    /// <returns>Oluşturulan ürün</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(
            nameof(GetProductById),
            new { id = result.Data!.Id },
            result);
    }

    /// <summary>
    /// Ürün bilgilerini güncelle
    /// </summary>
    /// <param name="id">Ürün ID</param>
    /// <param name="command">Güncellenmiş ürün bilgileri</param>
    /// <returns>Güncellenmiş ürün</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Ürünü sil (soft delete)
    /// </summary>
    /// <param name="id">Ürün ID</param>
    /// <returns>Silme işlemi sonucu</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var result = await Mediator.Send(new DeleteProductCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }
}

