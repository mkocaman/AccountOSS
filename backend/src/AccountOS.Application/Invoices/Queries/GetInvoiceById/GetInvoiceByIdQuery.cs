using AccountOS.Application.Common;
using AccountOS.Application.Invoices.Common;
using MediatR;

namespace AccountOS.Application.Invoices.Queries.GetInvoiceById;

/// <summary>
/// ID'ye göre fatura detayı getir
/// </summary>
public record GetInvoiceByIdQuery(Guid Id) : IRequest<Result<InvoiceDto>>;
