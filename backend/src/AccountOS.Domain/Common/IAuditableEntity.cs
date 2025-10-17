namespace AccountOS.Domain.Common;

/// <summary>
/// Audit bilgilerini içeren entity'ler için interface
/// Oluşturma ve güncelleme bilgilerini takip eder
/// </summary>
public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    Guid CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    Guid? UpdatedBy { get; set; }
}

