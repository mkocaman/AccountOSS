using AccountOS.Api.Controllers;
using AccountOS.Application.Expenses.Categories.Commands.CreateExpenseCategory;
using AccountOS.Application.Expenses.Categories.Commands.DeleteExpenseCategory;
using AccountOS.Application.Expenses.Categories.Commands.UpdateExpenseCategory;
using AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategories;
using AccountOS.Application.Expenses.Categories.Queries.GetExpenseCategoryById;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Gider kategorileri yönetimi
/// </summary>
[Authorize]
[Route("api/v1/expense-categories")]
public class ExpenseCategoriesController : BaseApiController
{
    /// <summary>
    /// Tüm kategorileri getir (sayfalama ile)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Common.PagedResult<Application.Expenses.Common.ExpenseCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories(
        [FromQuery] bool? isActive = null,
        [FromQuery] Guid? parentCategoryId = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await Mediator.Send(new GetExpenseCategoriesQuery
        {
            IsActive = isActive,
            ParentCategoryId = parentCategoryId,
            SearchTerm = searchTerm
        });

        if (!result.Success)
            return BadRequest(result);

        var items = result.Data ?? new List<Application.Expenses.Common.ExpenseCategoryDto>();
        var totalCount = items.Count;
        var pagedItems = items.Skip((page - 1) * pageSize).Take(pageSize).ToList();

        var pagedResult = new Application.Common.PagedResult<Application.Expenses.Common.ExpenseCategoryDto>
        {
            Items = pagedItems,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
        };

        return Ok(Application.Common.Result<Application.Common.PagedResult<Application.Expenses.Common.ExpenseCategoryDto>>.SuccessResult(pagedResult));
    }

    /// <summary>
    /// Tüm kategorileri getir (sayfalama olmadan - dropdown için)
    /// </summary>
    [HttpGet("all")]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.Expenses.Common.ExpenseCategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllCategories()
    {
        var result = await Mediator.Send(new GetExpenseCategoriesQuery
        {
            IsActive = true // Sadece aktif kategorileri getir
        });

        return Ok(result);
    }

    /// <summary>
    /// ID ile kategori getir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCategoryById(Guid id)
    {
        var result = await Mediator.Send(new GetExpenseCategoryByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Yeni kategori oluştur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseCategoryDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCategory([FromBody] CreateExpenseCategoryCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetCategoryById), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Kategori güncelle
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseCategoryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] UpdateExpenseCategoryCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Kategori sil
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCategory(Guid id)
    {
        var result = await Mediator.Send(new DeleteExpenseCategoryCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }
}

