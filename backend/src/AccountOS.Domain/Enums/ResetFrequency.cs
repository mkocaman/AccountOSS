namespace AccountOS.Domain.Enums;

/// <summary>
/// Evrak numarası reset sıklığı
/// </summary>
public enum ResetFrequency
{
    /// <summary>Hiçbir zaman reset etme</summary>
    Never = 0,
    
    /// <summary>Her yıl reset et</summary>
    Yearly = 1,
    
    /// <summary>Her ay reset et</summary>
    Monthly = 2
}

