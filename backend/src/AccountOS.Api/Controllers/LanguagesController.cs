using AccountOS.Application.Languages.Commands.CreateLanguage;
using AccountOS.Application.Languages.Commands.CreateTranslation;
using AccountOS.Application.Languages.Commands.DeleteLanguage;
using AccountOS.Application.Languages.Commands.DeleteTranslation;
using AccountOS.Application.Languages.Commands.UpdateLanguage;
using AccountOS.Application.Languages.Commands.UpdateTranslation;
using AccountOS.Application.Languages.Queries.GetLanguages;
using AccountOS.Application.Languages.Queries.GetTranslations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Dil ve çeviri yönetimi
/// </summary>
[Authorize]
public class LanguagesController : BaseApiController
{
    /// <summary>
    /// Dilleri listele
    /// </summary>
    /// <param name="activeOnly">Sadece aktif diller</param>
    /// <returns>Dil listesi</returns>
    [HttpGet]
    [AllowAnonymous] // Diller herkes tarafından görülebilir
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLanguages([FromQuery] bool activeOnly = true)
    {
        var result = await Mediator.Send(new GetLanguagesQuery { ActiveOnly = activeOnly });
        return FromResult(result);
    }

    /// <summary>
    /// Belirli dil için çevirileri getir
    /// </summary>
    /// <param name="languageCode">Dil kodu (TR, EN, RU, vb.)</param>
    /// <param name="category">Kategori filtresi (opsiyonel)</param>
    /// <returns>Çeviri key-value dictionary</returns>
    [HttpGet("{languageCode}/translations")]
    [AllowAnonymous] // Çeviriler herkes tarafından görülebilir
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTranslations(string languageCode, [FromQuery] string? category = null)
    {
        var result = await Mediator.Send(new GetTranslationsQuery 
        { 
            LanguageCode = languageCode,
            Category = category
        });

        if (!result.Success)
            return NotFound(result);

        return FromResult(result);
    }

    /// <summary>
    /// Yeni dil oluştur (Owner only)
    /// </summary>
    /// <param name="command">Dil bilgileri</param>
    /// <returns>Oluşturulan dil</returns>
    [HttpPost]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateLanguage([FromBody] CreateLanguageCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetLanguages), result);
    }

    /// <summary>
    /// Dil güncelle (Owner only)
    /// </summary>
    /// <param name="id">Dil ID</param>
    /// <param name="command">Güncellenmiş dil bilgileri</param>
    /// <returns>Güncellenen dil</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateLanguage(Guid id, [FromBody] UpdateLanguageCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Dil sil (Owner only)
    /// </summary>
    /// <param name="id">Dil ID</param>
    /// <returns>Silme sonucu</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteLanguage(Guid id)
    {
        var result = await Mediator.Send(new DeleteLanguageCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Çeviri oluştur veya güncelle (Owner only)
    /// </summary>
    /// <param name="command">Çeviri bilgileri</param>
    /// <returns>Oluşturulan/güncellenen çeviri</returns>
    [HttpPost("translations")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateTranslation([FromBody] CreateTranslationCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetTranslations), 
            new { languageCode = command.LanguageCode }, 
            result);
    }

    /// <summary>
    /// Çeviri güncelle (Owner only)
    /// </summary>
    /// <param name="id">Çeviri ID</param>
    /// <param name="command">Güncellenmiş çeviri bilgileri</param>
    /// <returns>Güncellenen çeviri</returns>
    [HttpPut("translations/{id:guid}")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdateTranslation(Guid id, [FromBody] UpdateTranslationCommand command)
    {
        if (id != command.Id)
            return BadRequest(new { success = false, message = "URL'deki ID ile command ID'si eşleşmiyor" });

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Çeviri sil (Owner only)
    /// </summary>
    /// <param name="id">Çeviri ID</param>
    /// <returns>Silme sonucu</returns>
    [HttpDelete("translations/{id:guid}")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteTranslation(Guid id)
    {
        var result = await Mediator.Send(new DeleteTranslationCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Test endpoint: Language seed data doğrulaması (Prompt 1.14 Verification)
    /// </summary>
    /// <returns>Seed data doğrulama sonucu</returns>
    [HttpGet("test/seed-verification")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifySeedData()
    {
        var languagesResult = await Mediator.Send(new GetLanguagesQuery { ActiveOnly = false });
        
        var expectedLanguages = new[] { "TR", "EN", "RU", "UZ", "AR" };
        var missingLanguages = expectedLanguages
            .Where(code => !languagesResult.Data!.Any(l => l.Code == code))
            .ToList();
        
        // Check translation count for Turkish
        var translationsResult = await Mediator.Send(new GetTranslationsQuery { LanguageCode = "TR" });
        
        return Ok(new
        {
            Success = missingLanguages.Count == 0 && translationsResult.Data!.Count >= 5,
            TotalLanguages = languagesResult.Data!.Count,
            ExpectedLanguageCount = 5,
            MissingLanguages = missingLanguages,
            FoundLanguages = languagesResult.Data.Select(l => l.Code).ToList(),
            TotalTranslations = translationsResult.Data!.Count,
            Message = missingLanguages.Count == 0 
                ? "✅ Language seed verification successful! All 5 languages found."
                : $"⚠️ Warning: {missingLanguages.Count} languages missing: {string.Join(", ", missingLanguages)}"
        });
    }
}

