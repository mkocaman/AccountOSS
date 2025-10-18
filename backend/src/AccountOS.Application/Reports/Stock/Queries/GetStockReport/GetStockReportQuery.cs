using AccountOS.Application.Common;
using AccountOS.Application.Reports.Stock;
using MediatR;

namespace AccountOS.Application.Reports.Stock.Queries.GetStockReport;

public record GetStockReportQuery : IRequest<Result<StockReportDto>>
{
    public string Currency { get; init; } = "TRY";
    public bool IncludeLowStockOnly { get; init; } = false;
}

