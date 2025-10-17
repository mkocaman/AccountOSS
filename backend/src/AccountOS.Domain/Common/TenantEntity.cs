namespace AccountOS.Domain.Common;

/// <summary>
/// Multi-tenant yapıda şirkete ait entity'ler için base sınıf
/// BaseEntity'den türer ve CompanyId ekler
/// Global Query Filter ile otomatik şirket izolasyonu sağlanır
/// </summary>
public abstract class TenantEntity : BaseEntity, ITenantEntity
{
    /// <summary>
    /// Bu kaydın ait olduğu şirketin ID'si
    /// Multi-tenant isolation için kritik alan
    /// </summary>
    public Guid CompanyId { get; set; }
    
    // Navigation property - opsiyonel, lazily load edilebilir
    // public Company Company { get; set; } = null!;
}

