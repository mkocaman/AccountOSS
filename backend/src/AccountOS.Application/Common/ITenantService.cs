namespace AccountOS.Application.Common;

/// <summary>
/// Multi-tenant yapıda mevcut şirket (tenant) bilgisini sağlar
/// HTTP request'ten veya JWT token'dan CompanyId'yi okur
/// </summary>
public interface ITenantService
{
    /// <summary>
    /// Mevcut isteğin ait olduğu şirketin ID'sini döndürür
    /// </summary>
    Guid GetCurrentCompanyId();
    
    /// <summary>
    /// Şirket ID'si mevcut mu kontrol eder
    /// </summary>
    bool HasCompanyId();
}

