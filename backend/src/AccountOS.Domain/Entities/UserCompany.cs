using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Kullanıcı-Şirket ilişkisi (Many-to-Many)
/// Bir kullanıcı birden fazla şirkete erişebilir
/// </summary>
public class UserCompany : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;
    
    /// <summary>
    /// Kullanıcının bu şirketteki varsayılan rolü
    /// </summary>
    public string Role { get; set; } = "User";
    
    /// <summary>
    /// Bu şirket kullanıcının varsayılan şirketi mi?
    /// </summary>
    public bool IsDefault { get; set; } = false;
    
    /// <summary>
    /// Kullanıcı bu şirkete erişim hakkı var mı?
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Kullanıcının şirkete katılma tarihi
    /// </summary>
    public DateTime JoinedAt { get; set; }
}

