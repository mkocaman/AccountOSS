using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Queries.GetTrialBalance;

public class GetTrialBalanceQueryHandler 
    : IRequestHandler<GetTrialBalanceQuery, Result<List<TrialBalanceDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetTrialBalanceQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<TrialBalanceDto>>> Handle(
        GetTrialBalanceQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<TrialBalanceDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Get all accounts
        var accounts = await _context.ChartOfAccounts
            .Where(a => a.CompanyId == companyId && a.IsActive)
            .OrderBy(a => a.AccountCode)
            .ToListAsync(cancellationToken);

        var trialBalance = new List<TrialBalanceDto>();

        foreach (var account in accounts)
        {
            // Get journal entry lines for this account in the period
            var lines = await _context.JournalEntryLines
                .Include(l => l.JournalEntry)
                .Where(l => l.AccountId == account.Id
                         && l.JournalEntry.CompanyId == companyId
                         && l.JournalEntry.Status == JournalEntryStatus.Posted
                         && l.JournalEntry.EntryDate >= request.StartDate
                         && l.JournalEntry.EntryDate <= request.EndDate)
                .ToListAsync(cancellationToken);

            var periodDebit = lines.Sum(l => l.DebitAmount);
            var periodCredit = lines.Sum(l => l.CreditAmount);

            // Calculate closing balance
            decimal closingDebit = 0;
            decimal closingCredit = 0;

            if (account.NormalBalance == BalanceType.Debit)
            {
                var balance = periodDebit - periodCredit;
                if (balance >= 0)
                    closingDebit = balance;
                else
                    closingCredit = Math.Abs(balance);
            }
            else
            {
                var balance = periodCredit - periodDebit;
                if (balance >= 0)
                    closingCredit = balance;
                else
                    closingDebit = Math.Abs(balance);
            }

            // Only include accounts with activity
            if (periodDebit > 0 || periodCredit > 0 || closingDebit > 0 || closingCredit > 0)
            {
                trialBalance.Add(new TrialBalanceDto
                {
                    AccountCode = account.AccountCode,
                    AccountName = account.AccountName,
                    OpeningDebit = 0, // TODO: Calculate opening balance
                    OpeningCredit = 0,
                    PeriodDebit = periodDebit,
                    PeriodCredit = periodCredit,
                    ClosingDebit = closingDebit,
                    ClosingCredit = closingCredit
                });
            }
        }

        return Result<List<TrialBalanceDto>>.Ok(trialBalance);
    }
}

