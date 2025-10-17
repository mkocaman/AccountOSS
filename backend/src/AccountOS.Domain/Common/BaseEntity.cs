namespace AccountOS.Domain.Common;

/// <summary>
/// Tüm entity'lerin türeyeceği base sınıf
/// Id, audit, soft delete ve domain event desteği sağlar
/// </summary>
public abstract class BaseEntity : IEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>
    /// Benzersiz tanımlayıcı (Primary Key)
    /// </summary>
    public Guid Id { get; set; }
    
    // ============ Audit Fields ============
    
    /// <summary>
    /// Kaydın oluşturulma zamanı (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Kaydı oluşturan kullanıcının ID'si
    /// </summary>
    public Guid CreatedBy { get; set; }
    
    /// <summary>
    /// Kaydın son güncellenme zamanı (UTC)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
    
    /// <summary>
    /// Kaydı güncelleyen kullanıcının ID'si
    /// </summary>
    public Guid? UpdatedBy { get; set; }
    
    // ============ Soft Delete ============
    
    /// <summary>
    /// Kayıt silinmiş mi? (Fiziksel silme yerine flag kullanılır)
    /// </summary>
    public bool IsDeleted { get; set; }
    
    /// <summary>
    /// Kaydın silinme zamanı (UTC)
    /// </summary>
    public DateTime? DeletedAt { get; set; }
    
    /// <summary>
    /// Kaydı silen kullanıcının ID'si
    /// </summary>
    public Guid? DeletedBy { get; set; }
    
    // ============ Concurrency Control ============
    
    /// <summary>
    /// Optimistic concurrency kontrolü için timestamp
    /// EF Core tarafından otomatik yönetilir
    /// </summary>
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    
    // ============ Domain Events ============
    
    /// <summary>
    /// Entity üzerinde gerçekleşen domain event'leri
    /// Private field - encapsulation
    /// </summary>
    private readonly List<IDomainEvent> _domainEvents = new();
    
    /// <summary>
    /// Domain event'lerini okumak için read-only koleksiyon
    /// </summary>
    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();
    
    /// <summary>
    /// Yeni bir domain event ekler
    /// </summary>
    public void AddDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
    
    /// <summary>
    /// Tüm domain event'leri temizler
    /// SaveChanges sonrası kullanılır
    /// </summary>
    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}

