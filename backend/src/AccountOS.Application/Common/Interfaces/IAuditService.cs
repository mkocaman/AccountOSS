using AccountOS.Domain.Enums;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Audit log servisi
/// </summary>
public interface IAuditService
{
    /// <summary>
    /// Audit log kaydı oluştur
    /// </summary>
    Task LogAsync(
        AuditAction action,
        string entityType,
        string entityId,
        string? entityName = null,
        object? oldValues = null,
        object? newValues = null,
        string? description = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Create action için audit log
    /// </summary>
    Task LogCreateAsync<TEntity>(
        TEntity entity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Update action için audit log
    /// </summary>
    Task LogUpdateAsync<TEntity>(
        TEntity oldEntity,
        TEntity newEntity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Delete action için audit log
    /// </summary>
    Task LogDeleteAsync<TEntity>(
        TEntity entity,
        string? description = null,
        CancellationToken cancellationToken = default) where TEntity : class;

    /// <summary>
    /// Login action için audit log
    /// </summary>
    Task LogLoginAsync(
        Guid userId,
        string userName,
        string email,
        bool success,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Email action için audit log
    /// </summary>
    Task LogEmailAsync(
        string toEmail,
        string subject,
        bool success,
        string? errorMessage = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Custom action için audit log
    /// </summary>
    Task LogCustomActionAsync(
        string action,
        string description,
        object? data = null,
        CancellationToken cancellationToken = default);
}

