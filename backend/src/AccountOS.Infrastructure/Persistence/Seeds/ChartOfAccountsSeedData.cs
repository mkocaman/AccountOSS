using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;

namespace AccountOS.Infrastructure.Persistence.Seeds;

/// <summary>
/// Standart Türk Hesap Planı (simplified)
/// </summary>
public static class ChartOfAccountsSeedData
{
    public static List<ChartOfAccount> GetStandardChartOfAccounts(Guid companyId, Guid createdBy)
    {
        var accounts = new List<ChartOfAccount>();
        var now = DateTime.UtcNow;

        // 1XX - DÖNEN VARLIKLAR (CURRENT ASSETS)
        accounts.Add(CreateAccount(companyId, createdBy, now, "100", "Kasa", AccountType.Asset, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "102", "Bankalar", AccountType.Asset, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "120", "Alıcılar", AccountType.Asset, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "153", "Ticari Mallar", AccountType.Asset, BalanceType.Debit, 0, true));

        // 2XX - DURAN VARLIKLAR (FIXED ASSETS)
        accounts.Add(CreateAccount(companyId, createdBy, now, "253", "Tesis, Makine ve Cihazlar", AccountType.Asset, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "257", "Birikmiş Amortismanlar", AccountType.Asset, BalanceType.Credit, 0, true));

        // 3XX - KISA VADELİ YABANCI KAYNAKLAR (CURRENT LIABILITIES)
        accounts.Add(CreateAccount(companyId, createdBy, now, "320", "Satıcılar", AccountType.Liability, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "360", "Ödenecek Vergi ve Fonlar", AccountType.Liability, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "391", "Hesaplanan KDV", AccountType.Liability, BalanceType.Credit, 0, true));

        // 4XX - UZUN VADELİ YABANCI KAYNAKLAR (LONG-TERM LIABILITIES)
        accounts.Add(CreateAccount(companyId, createdBy, now, "400", "Banka Kredileri", AccountType.Liability, BalanceType.Credit, 0, true));

        // 5XX - ÖZ SERMAYE (EQUITY)
        accounts.Add(CreateAccount(companyId, createdBy, now, "500", "Sermaye", AccountType.Equity, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "580", "Geçmiş Yıllar Karları", AccountType.Equity, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "590", "Dönem Net Karı/Zararı", AccountType.Equity, BalanceType.Credit, 0, true));

        // 6XX - GELİR HESAPLARI (REVENUE)
        accounts.Add(CreateAccount(companyId, createdBy, now, "600", "Yurt İçi Satışlar", AccountType.Revenue, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "601", "Yurt Dışı Satışlar", AccountType.Revenue, BalanceType.Credit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "610", "Satıştan İadeler (-)", AccountType.Revenue, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "646", "Faiz Gelirleri", AccountType.Revenue, BalanceType.Credit, 0, true));

        // 7XX - MALİYET HESAPLARI (COST OF GOODS SOLD)
        accounts.Add(CreateAccount(companyId, createdBy, now, "710", "Satılan Ticari Mallar Maliyeti", AccountType.CostOfGoodsSold, BalanceType.Debit, 0, true));

        // 77X - GİDER ÇEŞİTLERİ (EXPENSES)
        accounts.Add(CreateAccount(companyId, createdBy, now, "770", "Genel Yönetim Giderleri", AccountType.Expense, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "771", "Pazarlama Giderleri", AccountType.Expense, BalanceType.Debit, 0, true));
        accounts.Add(CreateAccount(companyId, createdBy, now, "780", "Finansman Giderleri", AccountType.Expense, BalanceType.Debit, 0, true));

        return accounts;
    }

    private static ChartOfAccount CreateAccount(
        Guid companyId,
        Guid createdBy,
        DateTime now,
        string code,
        string name,
        AccountType accountType,
        BalanceType normalBalance,
        int level,
        bool isSystemAccount)
    {
        return new ChartOfAccount
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            AccountCode = code,
            AccountName = name,
            AccountType = accountType,
            Level = level,
            NormalBalance = normalBalance,
            Currency = "TRY",
            IsActive = true,
            IsSystemAccount = isSystemAccount,
            CreatedAt = now,
            CreatedBy = createdBy
        };
    }
}

