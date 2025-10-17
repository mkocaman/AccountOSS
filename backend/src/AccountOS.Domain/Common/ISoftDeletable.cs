namespace AccountOS.Domain.Common;

/// <summary>
/// Soft delete destekleyen entity'ler için interface
/// Fiziksel silme yerine IsDeleted flag kullanır
/// </summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
    Guid? DeletedBy { get; set; }
}

