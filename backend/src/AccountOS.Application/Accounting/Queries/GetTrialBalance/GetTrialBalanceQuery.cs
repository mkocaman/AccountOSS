using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Queries.GetTrialBalance;

public record GetTrialBalanceQuery : IRequest<Result<List<TrialBalanceDto>>>
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}

