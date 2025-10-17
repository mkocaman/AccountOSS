namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Şu anki oturum açmış kullanıcı bilgilerini sağlar
/// JWT token'dan veya session'dan okunur
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Kullanıcı ID'si (JWT claim'den)
    /// </summary>
    Guid? UserId { get; }
    
    /// <summary>
    /// Kullanıcı email adresi
    /// </summary>
    string? Email { get; }
    
    /// <summary>
    /// Kullanıcı adı
    /// </summary>
    string? UserName { get; }
    
    /// <summary>
    /// Kullanıcı authenticate olmuş mu?
    /// </summary>
    bool IsAuthenticated { get; }
    
    /// <summary>
    /// Kullanıcının rolleri
    /// </summary>
    IEnumerable<string> Roles { get; }
    
    /// <summary>
    /// Kullanıcının belirli bir rolü var mı?
    /// </summary>
    bool IsInRole(string role);
}

