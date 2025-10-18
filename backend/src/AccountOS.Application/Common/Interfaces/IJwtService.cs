using System.Security.Claims;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// JWT token servisi
/// Token üretimi ve validation
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Access token üretir
    /// </summary>
    string GenerateAccessToken(Guid userId, string email, IEnumerable<string> roles, Guid? companyId = null);
    
    /// <summary>
    /// Refresh token üretir
    /// </summary>
    string GenerateRefreshToken();
    
    /// <summary>
    /// Token'dan claim'leri okur
    /// </summary>
    ClaimsPrincipal? GetPrincipalFromToken(string token);
}

