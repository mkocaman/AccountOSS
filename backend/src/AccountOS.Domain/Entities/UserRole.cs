using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Kullanıcı rolleri
/// Basit rol sistemi (RBAC için temel)
/// </summary>
public class UserRole : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    
    /// <summary>
    /// Rol adı (Admin, Manager, User, Accountant, vb.)
    /// </summary>
    public string RoleName { get; set; } = string.Empty;
}

