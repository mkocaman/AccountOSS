using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MimeKit;
using System.Text.RegularExpressions;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Email servisi implementasyonu (MailKit kullanarak)
/// </summary>
public class EmailService : IEmailService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IPdfService _pdfService;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IPdfService pdfService,
        ILogger<EmailService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _pdfService = pdfService;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(
        string toEmail,
        string toName,
        string subject,
        string htmlBody,
        string? plainTextBody = null,
        List<EmailAttachment>? attachments = null,
        string? cc = null,
        string? bcc = null,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
        {
            _logger.LogError("Cannot send email: Company ID is null");
            return false;
        }

        var companyId = _currentUser.CompanyId.Value;

        // Email configuration al
        var config = await _context.EmailConfigurations
            .Where(c => c.CompanyId == companyId && c.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (config == null)
        {
            _logger.LogError("Email configuration not found for company {CompanyId}", companyId);
            await LogEmailAsync(toEmail, toName, subject, htmlBody, plainTextBody, null, null, null, null, attachments, EmailStatus.Failed, "Email configuration not found", cancellationToken);
            return false;
        }

        try
        {
            // MimeMessage oluştur
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(config.SenderName, config.SenderEmail));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            // CC ekle
            if (!string.IsNullOrWhiteSpace(cc))
            {
                foreach (var ccEmail in cc.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    message.Cc.Add(MailboxAddress.Parse(ccEmail.Trim()));
                }
            }

            // Default CC ekle
            if (!string.IsNullOrWhiteSpace(config.DefaultCc))
            {
                foreach (var ccEmail in config.DefaultCc.Split(',', StringSplitOptions.RemoveEmptyEntries))
                {
                    message.Cc.Add(MailboxAddress.Parse(ccEmail.Trim()));
                }
            }

            // Body oluştur
            var builder = new BodyBuilder
            {
                HtmlBody = htmlBody,
                TextBody = plainTextBody ?? StripHtml(htmlBody)
            };

            // Attachment ekle
            if (attachments != null && attachments.Any())
            {
                foreach (var attachment in attachments)
                {
                    builder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                }
            }

            message.Body = builder.ToMessageBody();

            // SMTP ile gönder
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(config.SmtpHost, config.SmtpPort, config.UseSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None, cancellationToken);
            await smtp.AuthenticateAsync(config.Username, config.Password, cancellationToken);
            await smtp.SendAsync(message, cancellationToken);
            await smtp.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully to {ToEmail}", toEmail);
            await LogEmailAsync(toEmail, toName, subject, htmlBody, plainTextBody, null, null, null, null, attachments, EmailStatus.Sent, null, cancellationToken);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {ToEmail}", toEmail);
            await LogEmailAsync(toEmail, toName, subject, htmlBody, plainTextBody, null, null, null, null, attachments, EmailStatus.Failed, ex.Message, cancellationToken);
            return false;
        }
    }

    public async Task<bool> SendEmailFromTemplateAsync(
        EmailTemplateType templateType,
        string toEmail,
        string toName,
        Dictionary<string, string> variables,
        List<EmailAttachment>? attachments = null,
        Guid? relatedEntityId = null,
        string? relatedEntityType = null,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return false;

        var companyId = _currentUser.CompanyId.Value;

        // Template getir
        var template = await _context.EmailTemplates
            .Where(t => t.CompanyId == companyId && t.Type == templateType && t.IsActive)
            .OrderByDescending(t => t.IsDefault)
            .FirstOrDefaultAsync(cancellationToken);

        if (template == null)
        {
            _logger.LogWarning("Email template not found for type {TemplateType}", templateType);
            return false;
        }

        // Değişkenleri değiştir
        var subject = ReplaceVariables(template.Subject, variables);
        var htmlBody = ReplaceVariables(template.HtmlBody, variables);
        var plainTextBody = template.PlainTextBody != null ? ReplaceVariables(template.PlainTextBody, variables) : null;

        await LogEmailAsync(toEmail, toName, subject, htmlBody, plainTextBody, templateType, template.Id, relatedEntityId, relatedEntityType, attachments, EmailStatus.Pending, null, cancellationToken);

        return await SendEmailAsync(toEmail, toName, subject, htmlBody, plainTextBody, attachments, null, null, cancellationToken);
    }

    public async Task<bool> SendInvoiceEmailAsync(
        Guid invoiceId,
        string? additionalMessage = null,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return false;

        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.Id == invoiceId && i.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null || string.IsNullOrWhiteSpace(invoice.Customer.Email))
            return false;

        // PDF oluştur
        var invoiceDto = MapInvoiceToDto(invoice);
        var pdfBytes = _pdfService.GenerateInvoicePdf(invoiceDto);

        var attachment = new EmailAttachment
        {
            FileName = $"{invoice.InvoiceNumber}.pdf",
            Content = pdfBytes,
            ContentType = "application/pdf"
        };

        var variables = new Dictionary<string, string>
        {
            { "CustomerName", invoice.Customer.Name },
            { "InvoiceNumber", invoice.InvoiceNumber },
            { "InvoiceDate", invoice.InvoiceDate.ToString("dd.MM.yyyy") },
            { "DueDate", invoice.DueDate?.ToString("dd.MM.yyyy") ?? "-" },
            { "Amount", $"{invoice.GrandTotal:N2} {invoice.Currency}" },
            { "AdditionalMessage", additionalMessage ?? "" }
        };

        return await SendEmailFromTemplateAsync(EmailTemplateType.InvoiceSent, invoice.Customer.Email, invoice.Customer.Name, variables, new List<EmailAttachment> { attachment }, invoiceId, "Invoice", cancellationToken);
    }

    public async Task<bool> SendPaymentReminderAsync(
        Guid invoiceId,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            return false;

        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Where(i => i.Id == invoiceId && i.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null || string.IsNullOrWhiteSpace(invoice.Customer.Email) || invoice.RemainingAmount <= 0)
            return false;

        var daysOverdue = invoice.DueDate.HasValue ? (DateTime.UtcNow.Date - invoice.DueDate.Value.Date).Days : 0;

        var variables = new Dictionary<string, string>
        {
            { "CustomerName", invoice.Customer.Name },
            { "InvoiceNumber", invoice.InvoiceNumber },
            { "InvoiceDate", invoice.InvoiceDate.ToString("dd.MM.yyyy") },
            { "DueDate", invoice.DueDate?.ToString("dd.MM.yyyy") ?? "-" },
            { "Amount", $"{invoice.RemainingAmount:N2} {invoice.Currency}" },
            { "DaysOverdue", daysOverdue > 0 ? daysOverdue.ToString() : "0" }
        };

        var templateType = daysOverdue > 0 ? EmailTemplateType.InvoiceOverdue : EmailTemplateType.PaymentReminder;

        return await SendEmailFromTemplateAsync(templateType, invoice.Customer.Email, invoice.Customer.Name, variables, null, invoiceId, "Invoice", cancellationToken);
    }

    public async Task<bool> SendTestEmailAsync(
        string toEmail,
        CancellationToken cancellationToken = default)
    {
        var subject = "AccountOS Test Email";
        var htmlBody = $@"
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <h2>Test Email from AccountOS</h2>
                <p>This is a test email to verify your SMTP configuration.</p>
                <p>If you received this email, your email settings are working correctly!</p>
                <br>
                <p style='color: #666; font-size: 12px;'>
                    Sent at: {DateTime.UtcNow:dd.MM.yyyy HH:mm:ss} UTC
                </p>
            </body>
            </html>";

        return await SendEmailAsync(toEmail, "Test Recipient", subject, htmlBody, null, null, null, null, cancellationToken);
    }

    public async Task ProcessEmailQueueAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var retryEmails = await _context.EmailLogs
            .Where(l => (l.Status == EmailStatus.Pending || l.Status == EmailStatus.Retry)
                     && (l.NextRetryAt == null || l.NextRetryAt <= now)
                     && l.AttemptCount < 5)
            .OrderBy(l => l.CreatedAt)
            .Take(50)
            .ToListAsync(cancellationToken);

        foreach (var emailLog in retryEmails)
        {
            try
            {
                emailLog.Status = EmailStatus.Sending;
                emailLog.LastAttemptAt = now;
                emailLog.AttemptCount++;
                await _context.SaveChangesAsync(cancellationToken);

                var success = await SendEmailAsync(emailLog.ToEmail, emailLog.ToName ?? "", emailLog.Subject, emailLog.HtmlBody, emailLog.PlainTextBody, null, emailLog.CcEmails, emailLog.BccEmails, cancellationToken);

                if (success)
                {
                    emailLog.Status = EmailStatus.Sent;
                    emailLog.SentAt = now;
                    emailLog.ErrorMessage = null;
                    emailLog.NextRetryAt = null;
                }
                else
                {
                    if (emailLog.AttemptCount >= 5)
                    {
                        emailLog.Status = EmailStatus.PermanentFailure;
                        emailLog.NextRetryAt = null;
                    }
                    else
                    {
                        emailLog.Status = EmailStatus.Retry;
                        var retryDelayMinutes = emailLog.AttemptCount switch { 1 => 5, 2 => 15, 3 => 60, 4 => 240, _ => 1440 };
                        emailLog.NextRetryAt = now.AddMinutes(retryDelayMinutes);
                    }
                }

                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email queue for email {EmailId}", emailLog.Id);
                emailLog.Status = EmailStatus.Retry;
                emailLog.ErrorMessage = ex.Message;
                emailLog.NextRetryAt = now.AddMinutes(15);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        _logger.LogInformation("Processed {Count} emails from queue", retryEmails.Count);
    }

    // Helper Methods
    private async Task<EmailLog?> LogEmailAsync(
        string toEmail, string? toName, string subject, string htmlBody, string? plainTextBody,
        EmailTemplateType? templateType, Guid? templateId, Guid? relatedEntityId, string? relatedEntityType,
        List<EmailAttachment>? attachments, EmailStatus status, string? errorMessage,
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return null;

        var log = new EmailLog
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId.Value,
            ToEmail = toEmail,
            ToName = toName,
            Subject = subject,
            HtmlBody = htmlBody,
            PlainTextBody = plainTextBody,
            TemplateType = templateType,
            TemplateId = templateId,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
            AttachmentNames = attachments != null && attachments.Any() ? System.Text.Json.JsonSerializer.Serialize(attachments.Select(a => a.FileName).ToList()) : null,
            Status = status,
            AttemptCount = 0,
            ErrorMessage = errorMessage,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.EmailLogs.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
        return log;
    }

    private string ReplaceVariables(string template, Dictionary<string, string> variables)
    {
        var result = template;
        foreach (var variable in variables)
        {
            result = result.Replace($"{{{{{variable.Key}}}}}", variable.Value);
        }
        return result;
    }

    private string StripHtml(string html)
    {
        return Regex.Replace(html, "<.*?>", string.Empty);
    }

    private InvoiceDto MapInvoiceToDto(Invoice invoice)
    {
        return new InvoiceDto
        {
            Id = invoice.Id,
            CompanyId = invoice.CompanyId,
            InvoiceNumber = invoice.InvoiceNumber,
            Type = invoice.Type,
            TypeName = invoice.Type == InvoiceType.Sales ? "Satış" : "Alış",
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer.Name,
            CustomerCode = invoice.Customer.Code,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Currency = invoice.Currency,
            ExchangeRate = invoice.ExchangeRate,
            BaseCurrency = invoice.BaseCurrency,
            SubTotal = invoice.SubTotal,
            VatTotal = invoice.VatTotal,
            GrandTotal = invoice.GrandTotal,
            GrandTotalInBase = invoice.GrandTotalInBase,
            Status = invoice.Status,
            StatusName = GetStatusName(invoice.Status),
            PaidAmount = invoice.PaidAmount,
            RemainingAmount = invoice.RemainingAmount,
            Notes = invoice.Notes,
            Items = invoice.Items.Select(item => new InvoiceItemDto
            {
                Id = item.Id,
                LineNumber = item.LineNumber,
                ProductId = item.ProductId,
                ProductCode = item.ProductCode,
                ProductName = item.ProductName,
                Description = item.Description,
                Quantity = item.Quantity,
                Unit = item.Unit,
                UnitPrice = item.UnitPrice,
                DiscountPercentage = item.DiscountPercentage,
                DiscountAmount = item.DiscountAmount,
                VatRate = item.VatRate,
                SubTotal = item.SubTotal,
                VatAmount = item.VatAmount,
                Total = item.Total,
                FifoCost = item.FifoCost
            }).ToList(),
            CreatedAt = invoice.CreatedAt
        };
    }

    private string GetStatusName(InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "Taslak",
            InvoiceStatus.Issued => "Kesildi",
            InvoiceStatus.PartiallyPaid => "Kısmi Ödendi",
            InvoiceStatus.Paid => "Ödendi",
            InvoiceStatus.Overdue => "Vadesi Geçti",
            InvoiceStatus.Cancelled => "İptal",
            _ => status.ToString()
        };
    }
}
