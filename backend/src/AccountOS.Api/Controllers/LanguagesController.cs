using AccountOS.Application.Languages.Commands.CreateLanguage;
using AccountOS.Application.Languages.Commands.CreateTranslation;
using AccountOS.Application.Languages.Commands.DeleteLanguage;
using AccountOS.Application.Languages.Commands.DeleteTranslation;
using AccountOS.Application.Languages.Commands.UpdateLanguage;
using AccountOS.Application.Languages.Commands.UpdateTranslation;
using AccountOS.Application.Languages.Commands.SetDefaultLanguage;
using AccountOS.Application.Languages.Commands.ToggleLanguageActive;
using AccountOS.Application.Languages.Commands.BulkCreateTranslations;
using AccountOS.Application.Languages.Commands.ImportTranslations;
using AccountOS.Application.Languages.Commands.SyncMissingTranslations;
using AccountOS.Application.Languages.Queries.GetLanguages;
using AccountOS.Application.Languages.Queries.GetTranslations;
using AccountOS.Application.Languages.Queries.GetActiveLanguages;
using AccountOS.Application.Languages.Queries.GetDefaultLanguage;
using AccountOS.Application.Languages.Queries.GetTranslationCategories;
using AccountOS.Application.Languages.Queries.GetTranslationsForLanguage;
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
    /// Sadece aktif dilleri getir
    /// </summary>
    /// <returns>Aktif dil listesi</returns>
    [HttpGet("active")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveLanguages()
    {
        var result = await Mediator.Send(new GetActiveLanguagesQuery());
        return FromResult(result);
    }

    /// <summary>
    /// Varsayılan dili getir
    /// </summary>
    /// <returns>Varsayılan dil</returns>
    [HttpGet("default")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDefaultLanguage()
    {
        var result = await Mediator.Send(new GetDefaultLanguageQuery());
        
        if (!result.Success)
            return NotFound(result);
            
        return FromResult(result);
    }

    /// <summary>
    /// Belirli dil için çevirileri flat key-value olarak getir (i18n için)
    /// </summary>
    /// <param name="languageCode">Dil kodu (TR, EN, RU, vb.)</param>
    /// <returns>Çeviri key-value dictionary</returns>
    [HttpGet("language/{languageCode}")]
    [AllowAnonymous] // Çeviriler herkes tarafından görülebilir
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTranslationsForLanguage(string languageCode)
    {
        var result = await Mediator.Send(new GetTranslationsForLanguageQuery 
        { 
            LanguageCode = languageCode
        });

        if (!result.Success)
            return NotFound(result);

        return FromResult(result);
    }

    /// <summary>
    /// Çeviri kategorilerini getir
    /// </summary>
    /// <returns>Kategori listesi</returns>
    [HttpGet("translations/categories")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTranslationCategories()
    {
        var result = await Mediator.Send(new GetTranslationCategoriesQuery());
        return FromResult(result);
    }

    /// <summary>
    /// Tüm çevirileri listele (admin için)
    /// </summary>
    /// <param name="languageCode">Dil kodu filtresi</param>
    /// <param name="category">Kategori filtresi</param>
    /// <returns>Çeviri listesi</returns>
    [HttpGet("translations")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTranslations([FromQuery] string? languageCode = null, [FromQuery] string? category = null)
    {
        var result = await Mediator.Send(new GetTranslationsQuery 
        { 
            LanguageCode = languageCode,
            Category = category
        });

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
    /// Dili varsayılan yap (Owner only)
    /// </summary>
    /// <param name="id">Dil ID</param>
    /// <returns>Güncellenen dil</returns>
    [HttpPost("{id:guid}/set-default")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SetDefaultLanguage(Guid id)
    {
        var result = await Mediator.Send(new SetDefaultLanguageCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Dil aktif/pasif durumunu değiştir (Owner only)
    /// </summary>
    /// <param name="id">Dil ID</param>
    /// <returns>Güncellenen dil</returns>
    [HttpPost("{id:guid}/toggle-active")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ToggleLanguageActive(Guid id)
    {
        var result = await Mediator.Send(new ToggleLanguageActiveCommand(id));

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

        return CreatedAtAction(nameof(GetAllTranslations), result);
    }

    /// <summary>
    /// Toplu çeviri oluştur (Owner only)
    /// </summary>
    /// <param name="command">Toplu çeviri bilgileri</param>
    /// <returns>Oluşturma sonucu</returns>
    [HttpPost("translations/bulk")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> BulkCreateTranslations([FromBody] BulkCreateTranslationsCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
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
    /// JSON'dan çeviri import et (Owner only)
    /// </summary>
    /// <param name="command">Import bilgileri</param>
    /// <returns>Import sonucu</returns>
    [HttpPost("translations/import")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ImportTranslations([FromBody] ImportTranslationsCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Eksik çevirileri varsayılan dilden senkronize et (Owner only)
    /// </summary>
    /// <param name="targetLanguageId">Hedef dil ID</param>
    /// <returns>Senkronizasyon sonucu</returns>
    [HttpPost("translations/sync-missing/{targetLanguageId:guid}")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SyncMissingTranslations(Guid targetLanguageId)
    {
        var result = await Mediator.Send(new SyncMissingTranslationsCommand 
        { 
            TargetLanguageId = targetLanguageId 
        });

        if (!result.Success)
            return BadRequest(result);

        return FromResult(result);
    }

    /// <summary>
    /// Çevirileri JSON olarak export et (Owner only)
    /// </summary>
    /// <param name="languageId">Dil ID (opsiyonel - tüm diller)</param>
    /// <returns>JSON dosyası</returns>
    [HttpGet("translations/export/json")]
    [Authorize(Roles = "Owner")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportTranslationsJson([FromQuery] Guid? languageId = null)
    {
        Dictionary<string, Dictionary<string, string>> exportData = new();

        if (languageId.HasValue)
        {
            // Tek dil export
            var language = await Mediator.Send(new GetLanguagesQuery { ActiveOnly = false });
            var lang = language.Data?.FirstOrDefault(l => l.Id == languageId.Value);
            
            if (lang == null)
                return NotFound("Dil bulunamadı");

            var translations = await Mediator.Send(new GetTranslationsForLanguageQuery 
            { 
                LanguageCode = lang.Code 
            });

            if (translations.Success && translations.Data != null)
            {
                exportData[lang.Code] = translations.Data;
            }
        }
        else
        {
            // Tüm dilleri export
            var languages = await Mediator.Send(new GetLanguagesQuery { ActiveOnly = false });
            
            foreach (var lang in languages.Data ?? Enumerable.Empty<AccountOS.Application.Languages.Common.LanguageDto>())
            {
                var translations = await Mediator.Send(new GetTranslationsForLanguageQuery 
                { 
                    LanguageCode = lang.Code 
                });

                if (translations.Success && translations.Data != null)
                {
                    exportData[lang.Code] = translations.Data;
                }
            }
        }

        var json = System.Text.Json.JsonSerializer.Serialize(exportData, new System.Text.Json.JsonSerializerOptions 
        { 
            WriteIndented = true 
        });

        return File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", "translations.json");
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

