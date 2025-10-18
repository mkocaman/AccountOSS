using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Evrak numaralandırma servisi implementasyonu
/// </summary>
public class DocumentNumberingService : IDocumentNumberingService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<DocumentNumberingService> _logger;

    public DocumentNumberingService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ILogger<DocumentNumberingService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _logger = logger;
    }

    public async Task<string> GenerateNumberAsync(
        string documentType,
        string? subType = null,
        DateTime? documentDate = null,
        CancellationToken cancellationToken = default)
    {
        if (_currentUser.CompanyId == null)
            throw new UnauthorizedAccessException("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;
        var date = documentDate ?? DateTime.UtcNow;

        // Şablonu getir
        var template = await _context.DocumentNumberingTemplates
            .Where(t => t.CompanyId == companyId
                     && t.DocumentType == documentType
                     && (subType == null || t.SubType == subType)
                     && t.IsActive)
            .FirstOrDefaultAsync(cancellationToken);

        if (template == null)
        {
            // Default template yoksa oluştur
            template = await CreateDefaultTemplateAsync(
                companyId, 
                documentType, 
                subType, 
                cancellationToken);
        }

        // Reset kontrolü
        if (ShouldReset(template, date))
        {
            template.CurrentSequence = template.StartingNumber;
            template.LastResetDate = date;
            await _context.SaveChangesAsync(cancellationToken);
        }

        // Sequence'i artır
        var sequence = template.CurrentSequence;
        template.CurrentSequence++;
        await _context.SaveChangesAsync(cancellationToken);

        // Numarayı oluştur
        var number = BuildNumber(template, date, sequence);

        _logger.LogInformation(
            "Document number generated: {Number} for {DocumentType}/{SubType}",
            number, documentType, subType);

        return number;
    }

    public string GenerateExample(
        string template,
        string prefix,
        bool includeYear,
        string yearFormat,
        bool includeMonth,
        string monthFormat,
        int sequenceLength,
        int startingNumber)
    {
        var exampleDate = DateTime.UtcNow;
        var exampleTemplate = new DocumentNumberingTemplate
        {
            Template = template,
            Prefix = prefix,
            IncludeYear = includeYear,
            YearFormat = yearFormat,
            IncludeMonth = includeMonth,
            MonthFormat = monthFormat,
            SequenceLength = sequenceLength
        };

        return BuildNumber(exampleTemplate, exampleDate, startingNumber);
    }

    private bool ShouldReset(DocumentNumberingTemplate template, DateTime date)
    {
        if (template.ResetFrequency == ResetFrequency.Never)
            return false;

        if (template.LastResetDate == null)
            return false;

        var lastReset = template.LastResetDate.Value;

        return template.ResetFrequency switch
        {
            ResetFrequency.Yearly => date.Year > lastReset.Year,
            ResetFrequency.Monthly => date.Year > lastReset.Year || date.Month > lastReset.Month,
            _ => false
        };
    }

    private string BuildNumber(DocumentNumberingTemplate template, DateTime date, int sequence)
    {
        var result = template.Template;

        // {PREFIX} replacement
        result = result.Replace("{PREFIX}", template.Prefix);

        // {YEAR} replacement
        if (template.IncludeYear)
        {
            var year = template.YearFormat == "YY" 
                ? date.ToString("yy") 
                : date.ToString("yyyy");
            result = result.Replace("{YEAR}", year);
        }

        // {MONTH} replacement
        if (template.IncludeMonth)
        {
            var month = template.MonthFormat == "M" 
                ? date.Month.ToString() 
                : date.ToString("MM");
            result = result.Replace("{MONTH}", month);
        }

        // {SEQUENCE} replacement
        var paddedSequence = sequence.ToString($"D{template.SequenceLength}");
        result = result.Replace("{SEQUENCE}", paddedSequence);

        return result;
    }

    private async Task<DocumentNumberingTemplate> CreateDefaultTemplateAsync(
        Guid companyId,
        string documentType,
        string? subType,
        CancellationToken cancellationToken)
    {
        // Default template oluştur
        var prefix = documentType switch
        {
            "Invoice" when subType == "Sales" => "INV",
            "Invoice" when subType == "Purchase" => "PUR",
            "Payment" => "PAY",
            "Quote" => "QT",
            "Order" => "ORD",
            _ => "DOC"
        };

        var template = new DocumentNumberingTemplate
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            DocumentType = documentType,
            SubType = subType,
            Template = "{PREFIX}-{YEAR}-{SEQUENCE}",
            Prefix = prefix,
            IncludeYear = true,
            YearFormat = "YYYY",
            IncludeMonth = false,
            MonthFormat = "MM",
            SequenceLength = 4,
            StartingNumber = 1,
            CurrentSequence = 1,
            ResetFrequency = ResetFrequency.Yearly,
            LastResetDate = DateTime.UtcNow,
            ExampleOutput = $"{prefix}-{DateTime.UtcNow.Year}-0001",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.DocumentNumberingTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        return template;
    }
}

