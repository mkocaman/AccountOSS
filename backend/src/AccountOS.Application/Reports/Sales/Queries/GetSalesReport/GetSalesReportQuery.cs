using AccountOS.Application.Common;
using AccountOS.Application.Reports.Sales;
using MediatR;

namespace AccountOS.Application.Reports.Sales.Queries.GetSalesReport;

/// <summary>
/// Satış raporu sorgula
/// </summary>
public record GetSalesReportQuery : IRequest<Result<SalesReportDto>>
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? CustomerId { get; init; }
    public Guid? ProductId { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IncludeComparison { get; init; } = true;
}

