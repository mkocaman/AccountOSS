using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.DocumentNumbering.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.DocumentNumbering.Commands.CreateTemplate;

public class CreateDocumentNumberingTemplateCommandHandler 
    : IRequestHandler<CreateDocumentNumberingTemplateCommand, Result<DocumentNumberingTemplateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDocumentNumberingService _numberingService;

    public CreateDocumentNumberingTemplateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDocumentNumberingService numberingService)
    {
        _context = context;
        _currentUser = currentUser;
        _numberingService = numberingService;
    }

    public async Task<Result<DocumentNumberingTemplateDto>> Handle(
        CreateDocumentNumberingTemplateCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<DocumentNumberingTemplateDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Aynı DocumentType+SubType için şablon var mı kontrol et
        var existingTemplate = await _context.DocumentNumberingTemplates
            .Where(t => t.CompanyId == companyId
                     && t.DocumentType == request.DocumentType
                     && (request.SubType == null || t.SubType == request.SubType))
            .FirstOrDefaultAsync(cancellationToken);

        if (existingTemplate != null)
            return Result<DocumentNumberingTemplateDto>.Fail(
                "Bu evrak tipi için zaten bir şablon mevcut");

        // Örnek çıktı oluştur
        var exampleOutput = _numberingService.GenerateExample(
            request.Template,
            request.Prefix,
            request.IncludeYear,
            request.YearFormat,
            request.IncludeMonth,
            request.MonthFormat,
            request.SequenceLength,
            request.StartingNumber);

        var template = new DocumentNumberingTemplate
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            DocumentType = request.DocumentType,
            SubType = request.SubType,
            Template = request.Template,
            Prefix = request.Prefix,
            IncludeYear = request.IncludeYear,
            YearFormat = request.YearFormat,
            IncludeMonth = request.IncludeMonth,
            MonthFormat = request.MonthFormat,
            SequenceLength = request.SequenceLength,
            StartingNumber = request.StartingNumber,
            CurrentSequence = request.StartingNumber,
            ResetFrequency = request.ResetFrequency,
            LastResetDate = DateTime.UtcNow,
            ExampleOutput = exampleOutput,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId ?? Guid.Empty
        };

        _context.DocumentNumberingTemplates.Add(template);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(template);
        return Result<DocumentNumberingTemplateDto>.Ok(dto);
    }

    private static DocumentNumberingTemplateDto MapToDto(DocumentNumberingTemplate template)
    {
        return new DocumentNumberingTemplateDto
        {
            Id = template.Id,
            CompanyId = template.CompanyId,
            DocumentType = template.DocumentType,
            SubType = template.SubType,
            Template = template.Template,
            Prefix = template.Prefix,
            IncludeYear = template.IncludeYear,
            YearFormat = template.YearFormat,
            IncludeMonth = template.IncludeMonth,
            MonthFormat = template.MonthFormat,
            SequenceLength = template.SequenceLength,
            StartingNumber = template.StartingNumber,
            CurrentSequence = template.CurrentSequence,
            ResetFrequency = template.ResetFrequency,
            ResetFrequencyName = GetResetFrequencyName(template.ResetFrequency),
            LastResetDate = template.LastResetDate,
            ExampleOutput = template.ExampleOutput,
            IsActive = template.IsActive
        };
    }

    private static string GetResetFrequencyName(ResetFrequency frequency)
    {
        return frequency switch
        {
            ResetFrequency.Never => "Hiçbir Zaman",
            ResetFrequency.Yearly => "Her Yıl",
            ResetFrequency.Monthly => "Her Ay",
            _ => frequency.ToString()
        };
    }
}

