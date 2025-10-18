namespace AccountOS.Application.Search.Common;

/// <summary>
/// Global arama sonuç container
/// </summary>
public record SearchResultsDto
{
    public List<SearchResultItemDto> Results { get; init; } = new();
    public int TotalCount { get; init; }
}

/// <summary>
/// Global arama sonuç item
/// </summary>
public record SearchResultItemDto
{
    /// <summary>Sonuç tipi (Invoice, Customer, Product)</summary>
    public string Type { get; init; } = string.Empty;
    
    /// <summary>Entity ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Başlık</summary>
    public string Title { get; init; } = string.Empty;
    
    /// <summary>Alt başlık</summary>
    public string Subtitle { get; init; } = string.Empty;
    
    /// <summary>URL</summary>
    public string Url { get; init; } = string.Empty;
    
    /// <summary>İlgililik skoru (1.0 = en yüksek)</summary>
    public decimal? Relevance { get; init; }
}

