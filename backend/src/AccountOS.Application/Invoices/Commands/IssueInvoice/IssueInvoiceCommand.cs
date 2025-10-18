using AccountOS.Application.Common;
using AccountOS.Application.Invoices.Common;
using MediatR;

namespace AccountOS.Application.Invoices.Commands.IssueInvoice;

/// <summary>
/// Fatura kesme komutu (Draft → Issued + Stok hareketi)
/// </summary>
public record IssueInvoiceCommand(Guid InvoiceId) : IRequest<Result<InvoiceDto>>;
