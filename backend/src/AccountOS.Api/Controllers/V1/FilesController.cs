using AccountOS.Application.Common;
using AccountOS.Application.Files.Commands.UploadFile;
using AccountOS.Application.Files.Common;
using AccountOS.Application.Files.Queries.DownloadFile;
using AccountOS.Application.Files.Queries.GetFiles;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers.V1;

/// <summary>
/// Dosya yönetimi
/// </summary>
[Authorize]
[Route("api/v1/[controller]")]
[ApiController]
public class FilesController : ControllerBase
{
    private readonly IMediator _mediator;

    public FilesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Dosya yükle
    /// </summary>
    [HttpPost("upload")]
    [ProducesResponseType(typeof(Result<FileDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string? description = null, [FromForm] bool isPublic = false)
    {
        using var stream = file.OpenReadStream();
        
        var result = await _mediator.Send(new UploadFileCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType,
            FileSize = file.Length,
            Description = description,
            IsPublic = isPublic
        });

        return Ok(result);
    }

    /// <summary>
    /// Dosyaları listele
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Result<List<FileDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFiles(
        [FromQuery] StorageProvider? provider = null,
        [FromQuery] string? fileExtension = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await _mediator.Send(new GetFilesQuery
        {
            Provider = provider,
            FileExtension = fileExtension,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }

    /// <summary>
    /// Dosya indir
    /// </summary>
    [HttpGet("{id}/download")]
    public async Task<IActionResult> DownloadFile(Guid id)
    {
        var result = await _mediator.Send(new DownloadFileQuery(id));

        if (!result.Success)
            return BadRequest(result);

        return File(result.Data!.FileStream, result.Data.ContentType, result.Data.FileName);
    }
}

