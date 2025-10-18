using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Kullanıcı entity'si
/// Sistemde oturum açan kullanıcıları temsil eder
/// Bir kullanıcı birden fazla şirkete erişebilir (UserCompany join table)
/// </summary>
public class User : BaseEntity
{
    /// <summary>
    /// Email (unique)
    /// </summary>
    public string Email { get; set; } = string.Empty;
    
    /// <summary>
    /// Kullanıcı adı (unique, opsiyonel)
    /// </summary>
    public string? UserName { get; set; }
    
    /// <summary>
    /// Ad
    /// </summary>
    public string FirstName { get; set; } = string.Empty;
    
    /// <summary>
    /// Soyad
    /// </summary>
    public string LastName { get; set; } = string.Empty;
    
    /// <summary>
    /// Şifre hash (BCrypt)
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;
    
    /// <summary>
    /// Telefon
    /// </summary>
    public string? Phone { get; set; }
    
    /// <summary>
    /// Profil resmi
    /// </summary>
    public string? AvatarPath { get; set; }
    
    /// <summary>
    /// Email onaylandı mı?
    /// </summary>
    public bool EmailConfirmed { get; set; } = false;
    
    /// <summary>
    /// Email onaylama token
    /// </summary>
    public string? EmailConfirmationToken { get; set; }
    
    /// <summary>
    /// Şifre sıfırlama token
    /// </summary>
    public string? PasswordResetToken { get; set; }
    
    /// <summary>
    /// Şifre sıfırlama token bitiş zamanı
    /// </summary>
    public DateTime? PasswordResetTokenExpiresAt { get; set; }
    
    /// <summary>
    /// Son giriş zamanı
    /// </summary>
    public DateTime? LastLoginAt { get; set; }
    
    /// <summary>
    /// Kullanıcı aktif mi?
    /// </summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>
    /// Tam adı
    /// </summary>
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    // Navigation properties
    public ICollection<UserCompany> UserCompanies { get; set; } = new List<UserCompany>();
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}

