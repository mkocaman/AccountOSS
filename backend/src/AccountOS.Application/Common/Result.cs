namespace AccountOS.Application.Common;

/// <summary>
/// İşlem sonucu wrapper class
/// Başarılı/Başarısız durumları ve hata mesajlarını taşır
/// </summary>
public class Result
{
    protected Result(bool success, string error)
    {
        Success = success;
        Error = error;
    }

    public bool Success { get; }
    public string Error { get; }
    public bool IsFailure => !Success;

    /// <summary>
    /// Başarılı sonuç döndürür
    /// </summary>
    public static Result Ok() => new(true, string.Empty);

    /// <summary>
    /// Başarısız sonuç döndürür
    /// </summary>
    public static Result Fail(string error) => new(false, error);
}

/// <summary>
/// Generic Result class - veri içeren işlem sonuçları için
/// </summary>
public class Result<T> : Result
{
    private readonly T? _value;

    protected Result(T? value, bool success, string error) 
        : base(success, error)
    {
        _value = value;
    }

    public T Value => Success
        ? _value!
        : throw new InvalidOperationException("Başarısız bir sonuçtan değer okunamaz");

    /// <summary>
    /// Başarılı sonuç döndürür (veri ile)
    /// </summary>
    public static Result<T> Ok(T value) => new(value, true, string.Empty);

    /// <summary>
    /// Başarısız sonuç döndürür
    /// </summary>
    public new static Result<T> Fail(string error) => new(default, false, error);
}

