using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Mevcut kullanıcı servisi implementasyonu
/// JWT token'dan claim'leri okur
/// </summary>
public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    public Guid? CompanyId
    {
        get
        {
            var companyIdClaim = _httpContextAccessor.HttpContext?.User?
                .FindFirst("CompanyId")?.Value;
            
            return Guid.TryParse(companyIdClaim, out var companyId) ? companyId : null;
        }
    }

    public string? Email => _httpContextAccessor.HttpContext?.User?
        .FindFirst(ClaimTypes.Email)?.Value;

    public string? UserName => _httpContextAccessor.HttpContext?.User?
        .FindFirst(ClaimTypes.Name)?.Value;

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public IEnumerable<string> Roles
    {
        get
        {
            var roles = _httpContextAccessor.HttpContext?.User?
                .FindAll(ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();
            
            return roles ?? Enumerable.Empty<string>();
        }
    }

    public bool IsInRole(string role)
    {
        return _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;
    }
}

