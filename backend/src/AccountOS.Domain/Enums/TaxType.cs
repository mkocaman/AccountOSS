namespace AccountOS.Domain.Enums;

/// <summary>
/// Vergi tipi
/// </summary>
public enum TaxType
{
    /// <summary>Katma Değer Vergisi (VAT)</summary>
    Vat = 0,
    
    /// <summary>Gelir Vergisi Stopajı</summary>
    WithholdingIncomeTax = 1,
    
    /// <summary>KDV Stopajı</summary>
    WithholdingVat = 2,
    
    /// <summary>Özel Tüketim Vergisi (ÖTV)</summary>
    SpecialConsumptionTax = 3,
    
    /// <summary>Damga Vergisi</summary>
    StampDuty = 4,
    
    /// <summary>Banka ve Sigorta Muameleleri Vergisi (BSMV)</summary>
    BankingInsuranceTax = 5,
    
    /// <summary>Kurumlar Vergisi</summary>
    CorporateTax = 6,
    
    /// <summary>Diğer</summary>
    Other = 99
}

