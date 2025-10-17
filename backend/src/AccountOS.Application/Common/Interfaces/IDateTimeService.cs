namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Tarih ve zaman servisi
/// UTC bazlı çalışır, test edilebilir
/// DateTime.UtcNow yerine kullanılır (testlerde mock edilebilir)
/// </summary>
public interface IDateTimeService
{
    /// <summary>
    /// Şu anki UTC zamanı döndürür
    /// </summary>
    DateTime UtcNow { get; }
    
    /// <summary>
    /// Şu anki yerel zamanı döndürür (şirketin timezone'una göre)
    /// </summary>
    DateTime LocalNow { get; }
    
    /// <summary>
    /// UTC zamanı yerel zamana çevirir
    /// </summary>
    DateTime ConvertToLocal(DateTime utcDateTime);
    
    /// <summary>
    /// Yerel zamanı UTC'ye çevirir
    /// </summary>
    DateTime ConvertToUtc(DateTime localDateTime);
}

