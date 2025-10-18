using AccountOS.Application.Common;
using AccountOS.Application.Currencies.Common;
using MediatR;

namespace AccountOS.Application.Currencies.Commands.CreateCurrency;

/// <summary>
/// Yeni para birimi oluşturma komutu
/// </summary>
public record CreateCurrencyCommand : IRequest<Result<CurrencyDto>>
{
    /// <summary>Para birimi kodu (ISO 4217)</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Para birimi adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Sembol</summary>
    public string Symbol { get; init; } = string.Empty;
    
    /// <summary>Ondalık basamak sayısı</summary>
    public int DecimalPlaces { get; init; } = 2;
    
    /// <summary>Görüntüleme sırası</summary>
    public int DisplayOrder { get; init; } = 0;
}

