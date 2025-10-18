using AccountOS.Application.Common;
using AccountOS.Application.Currencies.Common;
using MediatR;

namespace AccountOS.Application.Currencies.Commands.CreateFxRate;

/// <summary>
/// Yeni döviz kuru oluşturma komutu
/// </summary>
public record CreateFxRateCommand : IRequest<Result<FxRateDto>>
{
    /// <summary>Baz para birimi kodu</summary>
    public string BaseCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Hedef para birimi kodu</summary>
    public string QuoteCurrencyCode { get; init; } = string.Empty;
    
    /// <summary>Kur</summary>
    public decimal Rate { get; init; }
    
    /// <summary>Geçerlilik tarihi</summary>
    public DateTime EffectiveDate { get; init; }
    
    /// <summary>Kaynak (TCMB, ECB, Manual)</summary>
    public string Source { get; init; } = "Manual";
}

