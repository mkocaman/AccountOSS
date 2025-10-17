namespace AccountOS.Domain.Common;

/// <summary>
/// Multi-tenant sistemde şirkete ait entity'ler için interface
/// Her kayıt bir şirkete aittir ve izolasyon sağlanır
/// </summary>
public interface ITenantEntity
{
    Guid CompanyId { get; set; }
}

