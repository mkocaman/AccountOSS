using AccountOS.Application.Companies.Commands.CreateCompany;
using AccountOS.Application.Companies.Commands.DeleteCompany;
using AccountOS.Application.Companies.Commands.InviteUser;
using AccountOS.Application.Companies.Commands.SetDefaultCompany;
using AccountOS.Application.Companies.Commands.UpdateCompany;
using AccountOS.Application.Companies.Queries.GetCompanies;
using AccountOS.Application.Companies.Queries.GetCompanyById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Şirket yönetimi endpoint'leri
/// </summary>
[Authorize] // JWT token zorunlu
public class CompaniesController : BaseApiController
{
    /// <summary>
    /// Yeni şirket oluştur
    /// </summary>
    /// <param name="command">Şirket bilgileri</param>
    /// <returns>Oluşturulan şirket</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command)
    {
        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return CreatedAtAction(
            nameof(GetCompanyById), 
            new { id = result.Data!.Id }, 
            new { success = true, data = result.Data });
    }

    /// <summary>
    /// Kullanıcının erişebildiği şirketleri listele
    /// </summary>
    /// <returns>Şirket listesi</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCompanies()
    {
        var result = await Mediator.Send(new GetCompaniesQuery());
        return FromResult(result);
    }

    /// <summary>
    /// ID'ye göre şirket detayı getir
    /// </summary>
    /// <param name="id">Şirket ID</param>
    /// <returns>Şirket detayı</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCompanyById(Guid id)
    {
        var result = await Mediator.Send(new GetCompanyByIdQuery(id));
        
        if (!result.Success)
            return NotFound(new { success = false, message = result.Error });
        
        return FromResult(result);
    }

    /// <summary>
    /// Şirket bilgilerini güncelle (Owner/Admin yetkisi gerekli)
    /// </summary>
    /// <param name="id">Şirket ID</param>
    /// <param name="command">Güncellenmiş şirket bilgileri</param>
    /// <returns>Güncellenmiş şirket</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Şirketi sil (Soft delete - sadece Owner)
    /// </summary>
    /// <param name="id">Şirket ID</param>
    /// <returns>Silme işlemi sonucu</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteCompany(Guid id)
    {
        var result = await Mediator.Send(new DeleteCompanyCommand(id));
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Varsayılan şirketi belirle
    /// </summary>
    /// <param name="id">Şirket ID</param>
    /// <returns>İşlem sonucu</returns>
    [HttpPost("{id:guid}/set-default")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SetDefaultCompany(Guid id)
    {
        var result = await Mediator.Send(new SetDefaultCompanyCommand(id));
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }

    /// <summary>
    /// Şirkete kullanıcı davet et (Owner/Admin yetkisi gerekli)
    /// </summary>
    /// <param name="id">Şirket ID</param>
    /// <param name="command">Davet bilgileri</param>
    /// <returns>Davet işlemi sonucu</returns>
    [HttpPost("{id:guid}/invite")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> InviteUser(Guid id, [FromBody] InviteUserToCompanyCommand command)
    {
        if (id != command.CompanyId)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);
        
        if (!result.Success)
            return BadRequest(result);
        
        return FromResult(result);
    }
}

