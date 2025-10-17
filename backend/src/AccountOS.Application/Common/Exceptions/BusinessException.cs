namespace AccountOS.Application.Common.Exceptions;

/// <summary>
/// İş kuralı ihlali exception
/// Validation'dan farklı - iş mantığı hataları için kullanılır
/// Örnek: "Yetersiz stok", "Fatura zaten onaylanmış"
/// </summary>
public class BusinessException : Exception
{
    public BusinessException(string message) : base(message)
    {
    }

    public BusinessException(string message, Exception innerException) 
        : base(message, innerException)
    {
    }
}

