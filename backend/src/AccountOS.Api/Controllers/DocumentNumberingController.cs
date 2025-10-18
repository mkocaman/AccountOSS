using AccountOS.Api.Controllers;
using AccountOS.Application.DocumentNumbering.Commands.CreateTemplate;
using AccountOS.Application.DocumentNumbering.Commands.UpdateTemplate;
using AccountOS.Application.DocumentNumbering.Queries.GetTemplates;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Evrak numaralandırma şablonları yönetimi
/// </summary>
[Authorize]
public class DocumentNumberingController : BaseApiController
{
    /// <summary>
    /// Tüm şablonları listele
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.DocumentNumbering.Common.DocumentNumberingTemplateDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTemplates(
        [FromQuery] string? documentType = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await Mediator.Send(new GetDocumentNumberingTemplatesQuery
        {
            DocumentType = documentType,
            IsActive = isActive
        });

        return Ok(result);
    }

    /// <summary>
    /// Yeni şablon oluştur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.DocumentNumbering.Common.DocumentNumberingTemplateDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateTemplate([FromBody] CreateDocumentNumberingTemplateCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetTemplates), result);
    }

    /// <summary>
    /// Şablonu güncelle
    /// </summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.DocumentNumbering.Common.DocumentNumberingTemplateDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateTemplate(Guid id, [FromBody] UpdateDocumentNumberingTemplateCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }
}

