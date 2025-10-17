using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Tarih ve zaman servisi implementasyonu
/// Şimdilik basit UTC implementasyonu
/// İleride timezone desteği eklenebilir
/// </summary>
public class DateTimeService : IDateTimeService
{
    public DateTime UtcNow => DateTime.UtcNow;
    
    // TODO: Şirketin timezone'una göre hesapla
    public DateTime LocalNow => DateTime.Now;
    
    public DateTime ConvertToLocal(DateTime utcDateTime)
    {
        // TODO: Şirketin timezone'u ile convert et
        return utcDateTime.ToLocalTime();
    }
    
    public DateTime ConvertToUtc(DateTime localDateTime)
    {
        // TODO: Şirketin timezone'undan convert et
        return localDateTime.ToUniversalTime();
    }
}

