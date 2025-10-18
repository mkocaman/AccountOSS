using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Invoices.Commands.CancelInvoice;

/// <summary>
/// Fatura iptal komutu
/// </summary>
public record CancelInvoiceCommand(Guid InvoiceId) : IRequest<Result<bool>>;
