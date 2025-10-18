using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Accounting.Queries.GetChartOfAccounts;

public record GetChartOfAccountsQuery : IRequest<Result<List<ChartOfAccountDto>>>
{
    public AccountType? AccountType { get; init; }
    public bool? IsActive { get; init; }
}

