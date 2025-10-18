using AccountOS.Domain.Enums;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Email gönderim servisi
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Email gönder
    /// </summary>
    Task<bool> SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        List<EmailAttachment>? attachments = null,
        string? cc = null,
        string? bcc = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Şablon kullanarak email gönder
    /// </summary>
    Task<bool> SendEmailFromTemplateAsync(
        EmailTemplateType templateType,
        string toEmail,
        string toName,
        Dictionary<string, string> variables,
        List<EmailAttachment>? attachments = null,
        Guid? relatedEntityId = null,
        string? relatedEntityType = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Fatura email'i gönder
    /// </summary>
    Task<bool> SendInvoiceEmailAsync(
        Guid invoiceId,
        string? additionalMessage = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ödeme hatırlatması gönder
    /// </summary>
    Task<bool> SendPaymentReminderAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Test email gönder
    /// </summary>
    Task<bool> SendTestEmailAsync(
        string toEmail,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Kuyruktaki email'leri işle
    /// </summary>
    Task ProcessEmailQueueAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Email attachment model
/// </summary>
public class EmailAttachment
{
    public string FileName { get; set; } = string.Empty;
    public byte[] Content { get; set; } = Array.Empty<byte>();
    public string ContentType { get; set; } = "application/octet-stream";
}

