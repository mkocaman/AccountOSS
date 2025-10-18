using AccountOS.Application.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Application.Search.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchInvoices;

/// <summary>
/// Gelişmiş fatura arama query
/// </summary>
public record SearchInvoicesQuery : IRequest<Result<List<InvoiceDto>>>
{
    public InvoiceSearchFilter Filter { get; init; } = new();
}

