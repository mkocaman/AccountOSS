namespace AccountOS.Domain.Enums;

/// <summary>
/// Ödeme tipi
/// </summary>
public enum PaymentType
{
    /// <summary>Tahsilat (müşteriden alınan)</summary>
    Receipt = 0,
    
    /// <summary>Ödeme (tedarikçiye yapılan)</summary>
    Payment = 1
}

