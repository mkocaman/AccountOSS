namespace AccountOS.Application.Customers.Common;

/// <summary>
/// Cari hesap ekstresi DTO
/// </summary>
public record CustomerStatementDto
{
    /// <summary>Şirket bilgileri</summary>
    public CompanyInfoDto Company { get; init; } = null!;
    
    /// <summary>Cari hesap bilgileri</summary>
    public CustomerInfoDto Customer { get; init; } = null!;
    
    /// <summary>Tarih aralığı</summary>
    public DateRangeDto DateRange { get; init; } = null!;
    
    /// <summary>İşlemler</summary>
    public List<CustomerTransactionDto> Transactions { get; init; } = new();
    
    /// <summary>Toplam borç (TL)</summary>
    public decimal TotalDebitTRY { get; init; }
    
    /// <summary>Toplam alacak (TL)</summary>
    public decimal TotalCreditTRY { get; init; }
    
    /// <summary>Bakiye (TL)</summary>
    public decimal BalanceTRY { get; init; }
    
    /// <summary>Toplam borç (USD)</summary>
    public decimal? TotalDebitUSD { get; init; }
    
    /// <summary>Toplam alacak (USD)</summary>
    public decimal? TotalCreditUSD { get; init; }
    
    /// <summary>Bakiye (USD)</summary>
    public decimal? BalanceUSD { get; init; }
    
    /// <summary>Toplam borç (EUR)</summary>
    public decimal? TotalDebitEUR { get; init; }
    
    /// <summary>Toplam alacak (EUR)</summary>
    public decimal? TotalCreditEUR { get; init; }
    
    /// <summary>Bakiye (EUR)</summary>
    public decimal? BalanceEUR { get; init; }
    
    /// <summary>Banka hesap bilgileri</summary>
    public List<BankAccountInfoDto> BankAccounts { get; init; } = new();
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime GeneratedAt { get; init; }
}

public record CompanyInfoDto
{
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string TaxOffice { get; init; } = string.Empty;
    public string TaxNumber { get; init; } = string.Empty;
    public string? Phone { get; init; }
    public string? Email { get; init; }
}

public record CustomerInfoDto
{
    public string Code { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string TaxOffice { get; init; } = string.Empty;
    public string TaxNumber { get; init; } = string.Empty;
}

public record DateRangeDto
{
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
}

public record CustomerTransactionDto
{
    public DateTime TransactionDate { get; init; }
    public string Description { get; init; } = string.Empty;
    public DateTime? DueDate { get; init; }
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
    public decimal Balance { get; init; }
    public string Currency { get; init; } = string.Empty;
}

public record BankAccountInfoDto
{
    public string BankName { get; init; } = string.Empty;
    public string BranchName { get; init; } = string.Empty;
    public string Currency { get; init; } = string.Empty;
    public string AccountNumber { get; init; } = string.Empty;
    public string IBAN { get; init; } = string.Empty;
}

