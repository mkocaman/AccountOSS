using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Reflection;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Audit service implementation
/// </summary>
public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<AuditService> _logger;

    public AuditService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IHttpContextAccessor httpContextAccessor,
        ILogger<AuditService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task LogAsync(
        AuditAction action,
        string entityType,
        string entityId,
        string? entityName = null,
        object? oldValues = null,
        object? newValues = null,
        string? description = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (_currentUser.UserId == null)
            {
                _logger.LogWarning("Cannot create audit log: User ID is null");
                return;
            }

            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                CompanyId = _currentUser.CompanyId,
                UserId = _currentUser.UserId.Value,
                UserName = _currentUser.UserName ?? "Unknown",
                UserEmail = _currentUser.Email ?? "unknown@unknown.com",
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                EntityName = entityName,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                ChangedProperties = GetChangedProperties(oldValues, newValues),
                Description = description,
                IpAddress = GetIpAddress(httpContext),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                Timestamp = DateTime.UtcNow,
                HttpMethod = httpContext?.Request.Method,
                RequestPath = httpContext?.Request.Path.ToString(),
                StatusCode = httpContext?.Response.StatusCode
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audit log for {EntityType} {EntityId}", entityType, entityId);
        }
    }

    public async Task LogCreateAsync<TEntity>(
        TEntity entity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class
    {
        var entityType = typeof(TEntity).Name;
        var entityId = GetEntityId(entity);
        var entityName = GetEntityName(entity);

        await LogAsync(
            AuditAction.Create,
            entityType,
            entityId,
            entityName,
            null,
            entity,
            description ?? $"{entityType} created",
            cancellationToken);
    }

    public async Task LogUpdateAsync<TEntity>(
        TEntity oldEntity,
        TEntity newEntity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class
    {
        var entityType = typeof(TEntity).Name;
        var entityId = GetEntityId(newEntity);
        var entityName = GetEntityName(newEntity);

        await LogAsync(
            AuditAction.Update,
            entityType,
            entityId,
            entityName,
            oldEntity,
            newEntity,
            description ?? $"{entityType} updated",
            cancellationToken);
    }

    public async Task LogDeleteAsync<TEntity>(
        TEntity entity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class
    {
        var entityType = typeof(TEntity).Name;
        var entityId = GetEntityId(entity);
        var entityName = GetEntityName(entity);

        await LogAsync(
            AuditAction.Delete,
            entityType,
            entityId,
            entityName,
            entity,
            null,
            description ?? $"{entityType} deleted",
            cancellationToken);
    }

    public async Task LogLoginAsync(
        Guid userId,
        string userName,
        string email,
        bool success,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var auditLog = new AuditLog
            {
                Id = Guid.NewGuid(),
                CompanyId = null, // Login olurken henüz company seçilmemiş olabilir
                UserId = userId,
                UserName = userName,
                UserEmail = email,
                Action = success ? AuditAction.Login : AuditAction.LoginFailed,
                EntityType = "User",
                EntityId = userId.ToString(),
                EntityName = userName,
                Description = success ? "User logged in successfully" : $"Login failed: {errorMessage}",
                IpAddress = GetIpAddress(httpContext),
                UserAgent = httpContext?.Request.Headers["User-Agent"].ToString(),
                Timestamp = DateTime.UtcNow,
                HttpMethod = httpContext?.Request.Method,
                RequestPath = httpContext?.Request.Path.ToString(),
                ErrorMessage = errorMessage
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging login attempt for user {UserId}", userId);
        }
    }

    public async Task LogEmailAsync(
        string toEmail,
        string subject,
        bool success,
        string? errorMessage = null,
        CancellationToken cancellationToken = default)
    {
        var data = new
        {
            ToEmail = toEmail,
            Subject = subject,
            Success = success,
            ErrorMessage = errorMessage
        };

        await LogAsync(
            AuditAction.EmailSent,
            "Email",
            toEmail,
            subject,
            null,
            data,
            success ? "Email sent successfully" : $"Email failed: {errorMessage}",
            cancellationToken);
    }

    public async Task LogCustomActionAsync(
        string action,
        string description,
        object? data = null,
        CancellationToken cancellationToken = default)
    {
        await LogAsync(
            AuditAction.Custom,
            "Custom",
            Guid.NewGuid().ToString(),
            action,
            null,
            data,
            description,
            cancellationToken);
    }

    // Helper Methods

    private string GetEntityId(object entity)
    {
        var idProperty = entity.GetType().GetProperty("Id");
        if (idProperty != null)
        {
            var idValue = idProperty.GetValue(entity);
            return idValue?.ToString() ?? Guid.NewGuid().ToString();
        }
        return Guid.NewGuid().ToString();
    }

    private string? GetEntityName(object entity)
    {
        // Try common name properties
        var nameProperties = new[] { "Name", "InvoiceNumber", "PaymentNumber", "Code", "Title", "Email" };
        
        foreach (var propName in nameProperties)
        {
            var property = entity.GetType().GetProperty(propName);
            if (property != null)
            {
                var value = property.GetValue(entity);
                if (value != null)
                    return value.ToString();
            }
        }

        return null;
    }

    private string? GetChangedProperties(object? oldValues, object? newValues)
    {
        if (oldValues == null || newValues == null)
            return null;

        var changedProps = new List<string>();
        var type = oldValues.GetType();

        foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            var oldValue = property.GetValue(oldValues);
            var newValue = property.GetValue(newValues);

            if (!Equals(oldValue, newValue))
            {
                changedProps.Add(property.Name);
            }
        }

        return changedProps.Any() 
            ? JsonSerializer.Serialize(changedProps)
            : null;
    }

    private string? GetIpAddress(HttpContext? context)
    {
        if (context == null)
            return null;

        // Check for forwarded IP first (behind proxy/load balancer)
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwardedFor))
        {
            var ips = forwardedFor.Split(',', StringSplitOptions.RemoveEmptyEntries);
            if (ips.Length > 0)
                return ips[0].Trim();
        }

        // Check for real IP header
        var realIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(realIp))
            return realIp;

        // Fallback to connection remote IP
        return context.Connection.RemoteIpAddress?.ToString();
    }
}

