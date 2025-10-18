using AccountOS.Application.Common;
using AccountOS.Application.Reports.ProfitLoss;
using MediatR;

namespace AccountOS.Application.Reports.ProfitLoss.Queries.GetProfitLossReport;

public record GetProfitLossReportQuery : IRequest<Result<ProfitLossReportDto>>
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public string Currency { get; init; } = "TRY";
}

