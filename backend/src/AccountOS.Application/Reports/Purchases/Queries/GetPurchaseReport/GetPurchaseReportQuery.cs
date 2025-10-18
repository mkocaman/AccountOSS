using AccountOS.Application.Common;
using AccountOS.Application.Reports.Purchases;
using MediatR;

namespace AccountOS.Application.Reports.Purchases.Queries.GetPurchaseReport;

public record GetPurchaseReportQuery : IRequest<Result<PurchaseReportDto>>
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public Guid? SupplierId { get; init; }
    public Guid? ProductId { get; init; }
    public string Currency { get; init; } = "TRY";
    public bool IncludeComparison { get; init; } = true;
}

