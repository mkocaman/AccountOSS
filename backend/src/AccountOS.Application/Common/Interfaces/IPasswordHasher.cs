namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Şifre hashleme servisi
/// BCrypt kullanır
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Şifreyi hashler
    /// </summary>
    string HashPassword(string password);
    
    /// <summary>
    /// Şifreyi doğrular
    /// </summary>
    bool VerifyPassword(string password, string passwordHash);
}

