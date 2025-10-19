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
    private readonly T? _data;

    protected Result(T? data, bool success, string error) 
        : base(success, error)
    {
        _data = data;
    }

    /// <summary>
    /// İşlem sonucu verisi (başarılıysa)
    /// </summary>
    public T? Data => _data;

    /// <summary>
    /// Başarılı sonuç döndürür (veri ile)
    /// </summary>
    public static Result<T> Ok(T data) => new(data, true, string.Empty);

    /// <summary>
    /// Başarısız sonuç döndürür
    /// </summary>
    public new static Result<T> Fail(string error) => new(default, false, error);
    
    /// <summary>
    /// Başarısız sonuç döndürür (errors listesi ile)
    /// </summary>
    public static Result<T> Failure(List<string> errors) => new(default, false, string.Join(", ", errors));
    
    /// <summary>
    /// Başarılı sonuç döndürür (SuccessResult methodu)
    /// </summary>
    public static Result<T> SuccessResult(T data) => new(data, true, string.Empty);
}

/// <summary>
/// Sayfalanmış veri döndüren sonuç tipi
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

