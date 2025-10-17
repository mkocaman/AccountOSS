namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Email gönderme servisi
/// SMTP veya SendGrid gibi sağlayıcılar kullanılabilir
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Basit email gönderir
    /// </summary>
    Task SendEmailAsync(string to, string subject, string body, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Template bazlı email gönderir
    /// </summary>
    Task SendTemplateEmailAsync(
        string to, 
        string templateName, 
        Dictionary<string, string> parameters,
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Toplu email gönderir
    /// </summary>
    Task SendBulkEmailAsync(
        IEnumerable<string> toList, 
        string subject, 
        string body,
        CancellationToken cancellationToken = default);
}

