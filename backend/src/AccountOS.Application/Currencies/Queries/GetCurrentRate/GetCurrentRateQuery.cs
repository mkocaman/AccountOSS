using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Currencies.Queries.GetCurrentRate;

/// <summary>
/// Belirli bir tarih için güncel kuru getir
/// </summary>
public record GetCurrentRateQuery : IRequest<Result<decimal>>
{
    /// <summary>Baz para birimi</summary>
    public string BaseCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Hedef para birimi</summary>
    public string QuoteCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Tarih (belirtilmezse bugün)</summary>
    public DateTime? AsOfDate { get; init; }
}

