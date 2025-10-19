using AccountOS.Api.Controllers;
using AccountOS.Application.Expenses.Commands.ApproveExpense;
using AccountOS.Application.Expenses.Commands.CreateExpense;
using AccountOS.Application.Expenses.Commands.DeleteExpense;
using AccountOS.Application.Expenses.Commands.MarkExpenseAsPaid;
using AccountOS.Application.Expenses.Commands.RejectExpense;
using AccountOS.Application.Expenses.Commands.UpdateExpense;
using AccountOS.Application.Expenses.Queries.GetExpenseById;
using AccountOS.Application.Expenses.Queries.GetExpenses;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AccountOS.Api.Controllers;

/// <summary>
/// Gider yönetimi
/// </summary>
[Authorize]
[Route("api/v1/expenses")]
public class ExpensesController : BaseApiController
{
    /// <summary>
    /// Tüm giderleri getir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(Application.Common.Result<List<Application.Expenses.Common.ExpenseDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetExpenses(
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] ExpenseStatus? status = null,
        [FromQuery] ExpenseApprovalStatus? approvalStatus = null,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] string? searchTerm = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        var result = await Mediator.Send(new GetExpensesQuery
        {
            CategoryId = categoryId,
            SupplierId = supplierId,
            Status = status,
            ApprovalStatus = approvalStatus,
            StartDate = startDate,
            EndDate = endDate,
            SearchTerm = searchTerm,
            PageNumber = pageNumber,
            PageSize = pageSize
        });

        return Ok(result);
    }

    /// <summary>
    /// ID ile gider getir
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetExpenseById(Guid id)
    {
        var result = await Mediator.Send(new GetExpenseByIdQuery(id));

        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Yeni gider oluştur
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateExpense([FromBody] CreateExpenseCommand command)
    {
        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetExpenseById), new { id = result.Data!.Id }, result);
    }

    /// <summary>
    /// Gider güncelle
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateExpense(Guid id, [FromBody] UpdateExpenseCommand command)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gider sil
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteExpense(Guid id)
    {
        var result = await Mediator.Send(new DeleteExpenseCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gideri onaya gönder
    /// </summary>
    [HttpPost("{id}/submit-for-approval")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitForApproval(Guid id)
    {
        var expense = await Mediator.Send(new GetExpenseByIdQuery(id));
        if (!expense.Success || expense.Data == null)
            return NotFound(expense);

        // TODO: Burada onay sürecini başlat
        // Şimdilik sadece expense'i geri dön
        return Ok(expense);
    }

    /// <summary>
    /// Gider onayla
    /// </summary>
    [HttpPost("{id}/approve")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ApproveExpense(Guid id)
    {
        var result = await Mediator.Send(new ApproveExpenseCommand(id));

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gider reddet
    /// </summary>
    [HttpPost("{id}/reject")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RejectExpense(Guid id, [FromBody] RejectExpenseCommand command)
    {
        if (id != command.ExpenseId)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gideri ödendi olarak işaretle
    /// </summary>
    [HttpPost("{id}/mark-as-paid")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAsPaid(Guid id, [FromBody] MarkExpenseAsPaidCommand command)
    {
        if (id != command.ExpenseId)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Gider ödemesi kaydet
    /// </summary>
    [HttpPost("{id}/record-payment")]
    [ProducesResponseType(typeof(Application.Common.Result<Application.Expenses.Common.ExpenseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordPayment(Guid id, [FromBody] MarkExpenseAsPaidCommand command)
    {
        if (id != command.ExpenseId)
            return BadRequest("ID mismatch");

        var result = await Mediator.Send(command);

        if (!result.Success)
            return BadRequest(Application.Common.Result<Application.Expenses.Common.ExpenseDto>.Fail(result.Error));

        // Güncel expense'i getir
        var expense = await Mediator.Send(new GetExpenseByIdQuery(id));
        return Ok(expense);
    }

    /// <summary>
    /// Gidere dosya ekle
    /// </summary>
    [HttpPost("{id}/attachments")]
    [ProducesResponseType(typeof(Application.Common.Result<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UploadAttachment(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Dosya seçilmedi");

        // TODO: Dosya yükleme mantığı implement edilecek
        // Şimdilik basit bir response dön
        return Ok(Application.Common.Result<object>.SuccessResult(new { message = "Dosya yükleme henüz implement edilmedi" }));
    }

    /// <summary>
    /// Giderden dosya sil
    /// </summary>
    [HttpDelete("{id}/attachments/{attachmentId}")]
    [ProducesResponseType(typeof(Application.Common.Result<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> DeleteAttachment(Guid id, Guid attachmentId)
    {
        // TODO: Dosya silme mantığı implement edilecek
        return Ok(Application.Common.Result<bool>.SuccessResult(true));
    }
}

