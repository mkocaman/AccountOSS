namespace AccountOS.Domain.Common;

/// <summary>
/// Domain event'leri için base interface
/// DDD pattern: Entity içinde gerçekleşen önemli olayları temsil eder
/// </summary>
public interface IDomainEvent
{
    /// <summary>
    /// Event'in gerçekleştiği zaman
    /// </summary>
    DateTime OccurredOn { get; }
}

