namespace AccountOS.Application.Common.Exceptions;

/// <summary>
/// Kayıt bulunamadı exception
/// HTTP 404 dönülmesi gereken durumlar için
/// </summary>
public class NotFoundException : Exception
{
    public NotFoundException(string name, object key)
        : base($"{name} bulunamadı. ID: {key}")
    {
    }

    public NotFoundException(string message) : base(message)
    {
    }
}

