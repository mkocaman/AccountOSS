using AccountOS.Domain.Enums;

namespace AccountOS.Application.Search.Common;

/// <summary>
/// Gelişmiş fatura arama filtreleri
/// </summary>
public record InvoiceSearchFilter
{
    public string? SearchText { get; init; }
    public Guid? CustomerId { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public InvoiceStatus? Status { get; init; }
    public string? Currency { get; init; }
    public decimal? MinAmount { get; init; }
    public decimal? MaxAmount { get; init; }
    
    // Sıralama
    public string SortBy { get; init; } = "date";
    public bool SortDescending { get; init; } = true;
    
    // Sayfalama
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

/// <summary>
/// Gelişmiş müşteri arama filtreleri
/// </summary>
public record CustomerSearchFilter
{
    public string? SearchText { get; init; }
    public string? TaxNumber { get; init; }
    public bool? IsActive { get; init; }
    
    // Sıralama
    public string SortBy { get; init; } = "name";
    public bool SortDescending { get; init; } = false;
    
    // Sayfalama
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

/// <summary>
/// Gelişmiş ürün arama filtreleri
/// </summary>
public record ProductSearchFilter
{
    public string? SearchText { get; init; }
    public decimal? MinPrice { get; init; }
    public decimal? MaxPrice { get; init; }
    public bool? InStock { get; init; }
    public bool? IsActive { get; init; }
    
    // Sıralama
    public string SortBy { get; init; } = "name";
    public bool SortDescending { get; init; } = false;
    
    // Sayfalama
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

