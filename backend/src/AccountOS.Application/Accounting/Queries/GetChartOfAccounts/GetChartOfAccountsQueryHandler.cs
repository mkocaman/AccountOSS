using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Queries.GetChartOfAccounts;

public class GetChartOfAccountsQueryHandler 
    : IRequestHandler<GetChartOfAccountsQuery, Result<List<ChartOfAccountDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetChartOfAccountsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<ChartOfAccountDto>>> Handle(
        GetChartOfAccountsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<ChartOfAccountDto>>.Fail("Şirket bilgisi bulunamadı");

        var query = _context.ChartOfAccounts
            .Where(a => a.CompanyId == _currentUser.CompanyId.Value);

        if (request.AccountType.HasValue)
            query = query.Where(a => a.AccountType == request.AccountType.Value);

        if (request.IsActive.HasValue)
            query = query.Where(a => a.IsActive == request.IsActive.Value);

        var accounts = await query
            .OrderBy(a => a.AccountCode)
            .Select(a => new ChartOfAccountDto
            {
                Id = a.Id,
                AccountCode = a.AccountCode,
                AccountName = a.AccountName,
                AccountType = a.AccountType,
                AccountTypeName = GetAccountTypeName(a.AccountType),
                ParentAccountId = a.ParentAccountId,
                ParentAccountName = a.ParentAccount != null ? a.ParentAccount.AccountName : null,
                Level = a.Level,
                NormalBalance = a.NormalBalance,
                NormalBalanceName = GetBalanceTypeName(a.NormalBalance),
                Currency = a.Currency,
                IsActive = a.IsActive,
                IsSystemAccount = a.IsSystemAccount
            })
            .ToListAsync(cancellationToken);

        return Result<List<ChartOfAccountDto>>.Ok(accounts);
    }

    private static string GetAccountTypeName(AccountType type)
    {
        return type switch
        {
            AccountType.Asset => "Varlıklar",
            AccountType.Liability => "Yükümlülükler",
            AccountType.Equity => "Öz Sermaye",
            AccountType.Revenue => "Gelirler",
            AccountType.Expense => "Giderler",
            AccountType.CostOfGoodsSold => "Satılan Malın Maliyeti",
            _ => type.ToString()
        };
    }

    private static string GetBalanceTypeName(BalanceType type)
    {
        return type switch
        {
            BalanceType.Debit => "Borç",
            BalanceType.Credit => "Alacak",
            _ => type.ToString()
        };
    }
}

