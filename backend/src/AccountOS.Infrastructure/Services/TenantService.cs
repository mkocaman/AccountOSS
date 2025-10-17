using AccountOS.Application.Common;
using Microsoft.AspNetCore.Http;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// HTTP context'ten mevcut şirket (tenant) bilgisini okur
/// </summary>
public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    
    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    
    /// <summary>
    /// Mevcut şirket ID'sini döndürür
    /// Öncelik sırası: 1) Header, 2) JWT Claim, 3) Query String
    /// </summary>
    public Guid GetCurrentCompanyId()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            // Background job veya test senaryosu
            return Guid.Empty;
        }
        
        // 1. Header'dan oku: X-Company-Id
        var companyIdHeader = httpContext.Request.Headers["X-Company-Id"].FirstOrDefault();
        if (!string.IsNullOrEmpty(companyIdHeader) && Guid.TryParse(companyIdHeader, out var companyIdFromHeader))
        {
            return companyIdFromHeader;
        }
        
        // 2. JWT claim'den oku
        var companyIdClaim = httpContext.User.FindFirst("CompanyId")?.Value;
        if (!string.IsNullOrEmpty(companyIdClaim) && Guid.TryParse(companyIdClaim, out var companyIdFromClaim))
        {
            return companyIdFromClaim;
        }
        
        // 3. Query string'den oku (fallback)
        var companyIdQuery = httpContext.Request.Query["companyId"].FirstOrDefault();
        if (!string.IsNullOrEmpty(companyIdQuery) && Guid.TryParse(companyIdQuery, out var companyIdFromQuery))
        {
            return companyIdFromQuery;
        }
        
        // Şirket ID'si bulunamadı
        throw new UnauthorizedAccessException("Company ID not found in request. Please provide X-Company-Id header or valid JWT token.");
    }
    
    /// <summary>
    /// Şirket ID'si mevcut mu?
    /// </summary>
    public bool HasCompanyId()
    {
        try
        {
            var companyId = GetCurrentCompanyId();
            return companyId != Guid.Empty;
        }
        catch
        {
            return false;
        }
    }
}

