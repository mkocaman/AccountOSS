using Microsoft.Extensions.Logging;
using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Email servisi implementasyonu
/// Şimdilik console'a log yazıyor (fake implementation)
/// İleride SMTP veya SendGrid ile değiştirilecek
/// </summary>
public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public async Task SendEmailAsync(
        string to, 
        string subject, 
        string body, 
        CancellationToken cancellationToken = default)
    {
        // TODO: Gerçek email gönderimi implement edilecek
        _logger.LogInformation(
            "Email gönderildi - To: {To}, Subject: {Subject}", 
            to, 
            subject);
        
        await Task.CompletedTask;
    }

    public async Task SendTemplateEmailAsync(
        string to, 
        string templateName, 
        Dictionary<string, string> parameters, 
        CancellationToken cancellationToken = default)
    {
        // TODO: Template engine ile email oluştur
        _logger.LogInformation(
            "Template email gönderildi - To: {To}, Template: {Template}", 
            to, 
            templateName);
        
        await Task.CompletedTask;
    }

    public async Task SendBulkEmailAsync(
        IEnumerable<string> toList, 
        string subject, 
        string body, 
        CancellationToken cancellationToken = default)
    {
        // TODO: Toplu email gönderimi
        var recipients = string.Join(", ", toList);
        _logger.LogInformation(
            "Toplu email gönderildi - To: {Recipients}, Subject: {Subject}", 
            recipients, 
            subject);
        
        await Task.CompletedTask;
    }
}

