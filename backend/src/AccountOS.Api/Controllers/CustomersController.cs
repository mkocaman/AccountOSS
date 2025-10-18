using AccountOS.Application.Customers.Commands.CreateCustomer;
using AccountOS.Application.Customers.Commands.DeleteCustomer;
using AccountOS.Application.Customers.Commands.UpdateCustomer;
using AccountOS.Application.Customers.Queries.GetCustomerById;
using AccountOS.Application.Customers.Queries.GetCustomers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Cari hesap (müşteri/tedarikçi) yönetimi
/// </summary>
[Authorize]
public class CustomersController : BaseApiController
{
    /// <summary>
    /// Cari hesapları listele
    /// </summary>
    /// <param name="searchTerm">Arama terimi (ad, kod, email)</param>
    /// <param name="activeOnly">Sadece aktif cari hesaplar</param>
    /// <returns>Cari hesap listesi</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool activeOnly = true)
    {
        var result = await Mediator.Send(new GetCustomersQuery 
        { 
            SearchTerm = searchTerm, 
            ActiveOnly = activeOnly 
        });
        
        return FromResult(result);
    }

    /// <summary>
    /// ID'ye göre cari hesap detayı getir
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <returns>Cari hesap detayı</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCustomerById(Guid id)
    {
        var result = await Mediator.Send(new GetCustomerByIdQuery(id));
        
        if (!result.Success)
            return NotFound(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Yeni cari hesap oluştur
    /// </summary>
    /// <param name="command">Cari hesap bilgileri</param>
    /// <returns>Oluşturulan cari hesap</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(
            nameof(GetCustomerById), 
            new { id = result.Data!.Id }, 
            result);
    }

    /// <summary>
    /// Cari hesap bilgilerini güncelle
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <param name="command">Güncellenmiş cari hesap bilgileri</param>
    /// <returns>Güncellenmiş cari hesap</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Cari hesabı sil (soft delete)
    /// </summary>
    /// <param name="id">Cari hesap ID</param>
    /// <returns>Silme işlemi sonucu</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeleteCustomer(Guid id)
    {
        var result = await Mediator.Send(new DeleteCustomerCommand(id));
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }
}

