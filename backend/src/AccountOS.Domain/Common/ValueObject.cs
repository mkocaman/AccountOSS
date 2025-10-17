namespace AccountOS.Domain.Common;

/// <summary>
/// Value Object'ler için base sınıf
/// DDD pattern: Kimliği olmayan, değerleri ile tanımlanan objeler
/// Örnek: Money, Address, DateRange
/// </summary>
public abstract class ValueObject : IEquatable<ValueObject>
{
    /// <summary>
    /// Value object'i tanımlayan değerleri döndürür
    /// Alt sınıflar override eder
    /// </summary>
    protected abstract IEnumerable<object?> GetEqualityComponents();
    
    /// <summary>
    /// İki value object eşit mi?
    /// </summary>
    public bool Equals(ValueObject? other)
    {
        if (other is null || other.GetType() != GetType())
            return false;
        
        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }
    
    public override bool Equals(object? obj)
    {
        return obj is ValueObject other && Equals(other);
    }
    
    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Select(x => x?.GetHashCode() ?? 0)
            .Aggregate((x, y) => x ^ y);
    }
    
    public static bool operator ==(ValueObject? left, ValueObject? right)
    {
        if (left is null && right is null)
            return true;
        
        if (left is null || right is null)
            return false;
        
        return left.Equals(right);
    }
    
    public static bool operator !=(ValueObject? left, ValueObject? right)
    {
        return !(left == right);
    }
}

