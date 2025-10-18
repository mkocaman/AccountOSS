using AccountOS.Application.Common;
using AccountOS.Application.Reports.CustomerBalances;
using MediatR;

namespace AccountOS.Application.Reports.CustomerBalances.Queries.GetCustomerBalanceReport;

public record GetCustomerBalanceReportQuery : IRequest<Result<CustomerBalanceReportDto>>
{
    public string Currency { get; init; } = "TRY";
    public bool IncludeAging { get; init; } = true;
}

