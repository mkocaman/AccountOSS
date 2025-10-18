using AccountOS.Application.Common;
using AccountOS.Application.Reports.Dashboard;
using MediatR;

namespace AccountOS.Application.Reports.Dashboard.Queries.GetDashboardStatistics;

public record GetDashboardStatisticsQuery : IRequest<Result<DashboardStatisticsDto>>
{
    public string Currency { get; init; } = "TRY";
}

