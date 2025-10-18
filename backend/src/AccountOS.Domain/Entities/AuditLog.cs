using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Audit log kaydı - tüm CRUD operasyonlarını takip eder
/// </summary>
public class AuditLog : BaseEntity
{
    /// <summary>Şirket ID (multi-tenant)</summary>
    public Guid? CompanyId { get; set; }
    
    /// <summary>İşlemi yapan kullanıcı ID</summary>
    public Guid UserId { get; set; }
    
    /// <summary>İşlemi yapan kullanıcı adı</summary>
    public string UserName { get; set; } = string.Empty;
    
    /// <summary>İşlemi yapan kullanıcı email</summary>
    public string UserEmail { get; set; } = string.Empty;
    
    /// <summary>İşlem tipi</summary>
    public AuditAction Action { get; set; }
    
    /// <summary>İşlem yapılan entity tipi</summary>
    public string EntityType { get; set; } = string.Empty;
    
    /// <summary>İşlem yapılan entity ID</summary>
    public string EntityId { get; set; } = string.Empty;
    
    /// <summary>Entity display name (örn: INV-2025-0001)</summary>
    public string? EntityName { get; set; }
    
    /// <summary>Değişiklik öncesi değerler (JSON)</summary>
    public string? OldValues { get; set; }
    
    /// <summary>Değişiklik sonrası değerler (JSON)</summary>
    public string? NewValues { get; set; }
    
    /// <summary>Değişen alanlar (JSON array)</summary>
    public string? ChangedProperties { get; set; }
    
    /// <summary>İşlem açıklaması</summary>
    public string? Description { get; set; }
    
    /// <summary>IP adresi</summary>
    public string? IpAddress { get; set; }
    
    /// <summary>User Agent (browser info)</summary>
    public string? UserAgent { get; set; }
    
    /// <summary>İşlem tarihi</summary>
    public DateTime Timestamp { get; set; }
    
    /// <summary>HTTP method (GET, POST, PUT, DELETE)</summary>
    public string? HttpMethod { get; set; }
    
    /// <summary>Request path</summary>
    public string? RequestPath { get; set; }
    
    /// <summary>Response status code</summary>
    public int? StatusCode { get; set; }
    
    /// <summary>İşlem süresi (ms)</summary>
    public long? Duration { get; set; }
    
    /// <summary>Hata mesajı (varsa)</summary>
    public string? ErrorMessage { get; set; }
    
    /// <summary>Stack trace (hata durumunda)</summary>
    public string? StackTrace { get; set; }
    
    // Navigation Properties
    public virtual User? User { get; set; }
    public virtual Company? Company { get; set; }
}

