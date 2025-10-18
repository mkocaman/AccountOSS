using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.DocumentNumbering.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.DocumentNumbering.Commands.UpdateTemplate;

public class UpdateDocumentNumberingTemplateCommandHandler 
    : IRequestHandler<UpdateDocumentNumberingTemplateCommand, Result<DocumentNumberingTemplateDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IDocumentNumberingService _numberingService;

    public UpdateDocumentNumberingTemplateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IDocumentNumberingService numberingService)
    {
        _context = context;
        _currentUser = currentUser;
        _numberingService = numberingService;
    }

    public async Task<Result<DocumentNumberingTemplateDto>> Handle(
        UpdateDocumentNumberingTemplateCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<DocumentNumberingTemplateDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var template = await _context.DocumentNumberingTemplates
            .Where(t => t.Id == request.Id && t.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (template == null)
            return Result<DocumentNumberingTemplateDto>.Fail("Şablon bulunamadı");

        // Güncelle
        template.Template = request.Template;
        template.Prefix = request.Prefix;
        template.IncludeYear = request.IncludeYear;
        template.YearFormat = request.YearFormat;
        template.IncludeMonth = request.IncludeMonth;
        template.MonthFormat = request.MonthFormat;
        template.SequenceLength = request.SequenceLength;
        template.ResetFrequency = request.ResetFrequency;
        template.IsActive = request.IsActive;

        // Örnek çıktıyı güncelle
        template.ExampleOutput = _numberingService.GenerateExample(
            template.Template,
            template.Prefix,
            template.IncludeYear,
            template.YearFormat,
            template.IncludeMonth,
            template.MonthFormat,
            template.SequenceLength,
            template.CurrentSequence);

        template.UpdatedAt = DateTime.UtcNow;
        template.UpdatedBy = _currentUser.UserId ?? Guid.Empty;

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DocumentNumberingTemplateDto
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

        return Result<DocumentNumberingTemplateDto>.Ok(dto);
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

