using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Commands.InitializeChartOfAccounts;

public record InitializeChartOfAccountsCommand : IRequest<Result<int>>;

