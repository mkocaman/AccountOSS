namespace AccountOS.Application.Reports.CustomerBalances;

/// <summary>
/// Cari hesap bakiye raporu DTO
/// </summary>
public record CustomerBalanceReportDto
{
    public DateTime GeneratedAt { get; init; }
    public CustomerBalanceSummary Summary { get; init; } = null!;
    public List<CustomerBalanceDto> Balances { get; init; } = new();
    public List<AgedReceivableDto> AgedReceivables { get; init; } = new();
}

public record CustomerBalanceSummary
{
    /// <summary>Toplam müşteri sayısı</summary>
    public int TotalCustomers { get; init; }
    
    /// <summary>Alacaklı müşteri sayısı</summary>
    public int CustomersWithReceivables { get; init; }
    
    /// <summary>Borçlu müşteri sayısı</summary>
    public int CustomersWithPayables { get; init; }
    
    /// <summary>Toplam alacaklar</summary>
    public decimal TotalReceivables { get; init; }
    
    /// <summary>Toplam borçlar</summary>
    public decimal TotalPayables { get; init; }
    
    /// <summary>Net bakiye</summary>
    public decimal NetBalance => TotalReceivables - TotalPayables;
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
}

public record CustomerBalanceDto
{
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public decimal Debit { get; init; }
    public decimal Credit { get; init; }
    public decimal Balance => Debit - Credit;
    public string Currency { get; init; } = string.Empty;
    public string BalanceType => Balance > 0 ? "Alacak" : Balance < 0 ? "Borç" : "Dengede";
}

public record AgedReceivableDto
{
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public decimal Current { get; init; }      // 0-30 days
    public decimal Days30 { get; init; }       // 31-60 days
    public decimal Days60 { get; init; }       // 61-90 days
    public decimal Days90Plus { get; init; }   // 90+ days
    public decimal TotalReceivable { get; init; }
    public string Currency { get; init; } = string.Empty;
}

