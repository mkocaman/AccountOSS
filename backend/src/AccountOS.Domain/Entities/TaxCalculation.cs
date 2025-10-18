using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Vergi hesaplama detayları
/// </summary>
public class TaxCalculation : TenantEntity
{
    /// <summary>Bağlı olduğu entity tipi</summary>
    public string EntityType { get; set; } = string.Empty;
    
    /// <summary>Bağlı olduğu entity ID</summary>
    public Guid EntityId { get; set; }
    
    /// <summary>Vergi tipi</summary>
    public TaxType TaxType { get; set; }
    
    /// <summary>Vergi oranı ID</summary>
    public Guid TaxRateId { get; set; }
    
    /// <summary>Matrah (tax base)</summary>
    public decimal TaxBase { get; set; }
    
    /// <summary>Vergi oranı (%)</summary>
    public decimal Rate { get; set; }
    
    /// <summary>Vergi tutarı</summary>
    public decimal TaxAmount { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Hesaplama tarihi</summary>
    public DateTime CalculationDate { get; set; }
    
    /// <summary>Hesaplama detayları (JSON)</summary>
    public string? CalculationDetails { get; set; }
    
    // Navigation Properties
    public TaxRate TaxRate { get; set; } = null!;
}

