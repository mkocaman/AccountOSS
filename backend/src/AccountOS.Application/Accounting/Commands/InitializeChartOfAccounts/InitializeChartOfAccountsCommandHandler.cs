using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Commands.InitializeChartOfAccounts;

public class InitializeChartOfAccountsCommandHandler 
    : IRequestHandler<InitializeChartOfAccountsCommand, Result<int>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public InitializeChartOfAccountsCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<int>> Handle(
        InitializeChartOfAccountsCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<int>.Fail("Kullanıcı bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var userId = _currentUser.UserId.Value;

        // Check if already initialized
        var existingAccounts = await _context.ChartOfAccounts
            .Where(a => a.CompanyId == companyId)
            .AnyAsync(cancellationToken);

        if (existingAccounts)
            return Result<int>.Fail("Hesap planı zaten oluşturulmuş");

        // Create standard chart of accounts (inline to avoid Infrastructure dependency)
        var accounts = GetStandardChartOfAccounts(companyId, userId);

        _context.ChartOfAccounts.AddRange(accounts);
        await _context.SaveChangesAsync(cancellationToken);

        // Also initialize tax rates
        var taxRates = GetStandardTaxRates(companyId, userId);
        _context.TaxRates.AddRange(taxRates);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<int>.Ok(accounts.Count);
    }

    private static List<ChartOfAccount> GetStandardChartOfAccounts(Guid companyId, Guid userId)
    {
        var accounts = new List<ChartOfAccount>();
        var now = DateTime.UtcNow;

        // 1XX - DÖNEN VARLIKLAR (CURRENT ASSETS)
        accounts.Add(CreateAccount(companyId, userId, now, "100", "Kasa", AccountType.Asset, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "102", "Bankalar", AccountType.Asset, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "120", "Alıcılar", AccountType.Asset, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "153", "Ticari Mallar", AccountType.Asset, BalanceType.Debit));

        // 2XX - DURAN VARLIKLAR (FIXED ASSETS)
        accounts.Add(CreateAccount(companyId, userId, now, "253", "Tesis, Makine ve Cihazlar", AccountType.Asset, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "257", "Birikmiş Amortismanlar", AccountType.Asset, BalanceType.Credit));

        // 3XX - KISA VADELİ YABANCI KAYNAKLAR (CURRENT LIABILITIES)
        accounts.Add(CreateAccount(companyId, userId, now, "320", "Satıcılar", AccountType.Liability, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "360", "Ödenecek Vergi ve Fonlar", AccountType.Liability, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "391", "Hesaplanan KDV", AccountType.Liability, BalanceType.Credit));

        // 4XX - UZUN VADELİ YABANCI KAYNAKLAR (LONG-TERM LIABILITIES)
        accounts.Add(CreateAccount(companyId, userId, now, "400", "Banka Kredileri", AccountType.Liability, BalanceType.Credit));

        // 5XX - ÖZ SERMAYE (EQUITY)
        accounts.Add(CreateAccount(companyId, userId, now, "500", "Sermaye", AccountType.Equity, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "580", "Geçmiş Yıllar Karları", AccountType.Equity, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "590", "Dönem Net Karı/Zararı", AccountType.Equity, BalanceType.Credit));

        // 6XX - GELİR HESAPLARI (REVENUE)
        accounts.Add(CreateAccount(companyId, userId, now, "600", "Yurt İçi Satışlar", AccountType.Revenue, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "601", "Yurt Dışı Satışlar", AccountType.Revenue, BalanceType.Credit));
        accounts.Add(CreateAccount(companyId, userId, now, "610", "Satıştan İadeler (-)", AccountType.Revenue, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "646", "Faiz Gelirleri", AccountType.Revenue, BalanceType.Credit));

        // 7XX - MALİYET HESAPLARI (COST OF GOODS SOLD)
        accounts.Add(CreateAccount(companyId, userId, now, "710", "Satılan Ticari Mallar Maliyeti", AccountType.CostOfGoodsSold, BalanceType.Debit));

        // 77X - GİDER ÇEŞİTLERİ (EXPENSES)
        accounts.Add(CreateAccount(companyId, userId, now, "770", "Genel Yönetim Giderleri", AccountType.Expense, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "771", "Pazarlama Giderleri", AccountType.Expense, BalanceType.Debit));
        accounts.Add(CreateAccount(companyId, userId, now, "780", "Finansman Giderleri", AccountType.Expense, BalanceType.Debit));

        return accounts;
    }

    private static ChartOfAccount CreateAccount(Guid companyId, Guid userId, DateTime now, 
        string code, string name, AccountType type, BalanceType balance)
    {
        return new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            AccountCode = code,
            AccountName = name,
            AccountType = type,
            Level = 0,
            NormalBalance = balance,
            Currency = "TRY",
            IsActive = true,
            IsSystemAccount = true,
            CreatedAt = now,
            CreatedBy = userId
        };
    }

    private static List<TaxRate> GetStandardTaxRates(Guid companyId, Guid userId)
    {
        var taxRates = new List<TaxRate>();
        var now = DateTime.UtcNow;
        var effectiveFrom = new DateTime(2024, 1, 1);

        // KDV Oranları (Türkiye)
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.Vat, "KDV20", "KDV %20", 20m, effectiveFrom, true));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.Vat, "KDV10", "KDV %10", 10m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.Vat, "KDV1", "KDV %1", 1m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.Vat, "KDV0", "KDV %0 (İstisna)", 0m, effectiveFrom, false));

        // Gelir Vergisi Stopajı
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.WithholdingIncomeTax, "GVS20", "Gelir Vergisi Stopajı %20", 20m, effectiveFrom, true));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.WithholdingIncomeTax, "GVS15", "Gelir Vergisi Stopajı %15", 15m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.WithholdingIncomeTax, "GVS10", "Gelir Vergisi Stopajı %10", 10m, effectiveFrom, false));

        // KDV Stopajı
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.WithholdingVat, "KDVS90", "KDV Stopajı %90", 90m, effectiveFrom, false));
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.WithholdingVat, "KDVS50", "KDV Stopajı %50", 50m, effectiveFrom, false));

        // Damga Vergisi
        taxRates.Add(CreateTaxRate(companyId, userId, now, TaxType.StampDuty, "DV0.948", "Damga Vergisi %0.948", 0.948m, effectiveFrom, true));

        return taxRates;
    }

    private static TaxRate CreateTaxRate(Guid companyId, Guid userId, DateTime now,
        TaxType taxType, string code, string name, decimal rate, DateTime effectiveFrom, bool isDefault)
    {
        return new TaxRate
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            TaxType = taxType,
            Name = name,
            Code = code,
            Rate = rate,
            EffectiveFrom = effectiveFrom,
            CountryCode = "TR",
            IsDefault = isDefault,
            IsActive = true,
            CreatedAt = now,
            CreatedBy = userId
        };
    }
}

