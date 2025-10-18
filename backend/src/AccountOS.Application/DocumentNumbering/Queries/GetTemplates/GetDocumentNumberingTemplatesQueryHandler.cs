using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.DocumentNumbering.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.DocumentNumbering.Queries.GetTemplates;

public class GetDocumentNumberingTemplatesQueryHandler 
    : IRequestHandler<GetDocumentNumberingTemplatesQuery, Result<List<DocumentNumberingTemplateDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetDocumentNumberingTemplatesQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<DocumentNumberingTemplateDto>>> Handle(
        GetDocumentNumberingTemplatesQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<DocumentNumberingTemplateDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.DocumentNumberingTemplates
            .Where(t => t.CompanyId == companyId);

        if (!string.IsNullOrWhiteSpace(request.DocumentType))
            query = query.Where(t => t.DocumentType == request.DocumentType);

        if (request.IsActive.HasValue)
            query = query.Where(t => t.IsActive == request.IsActive.Value);

        var templates = await query
            .OrderBy(t => t.DocumentType)
            .ThenBy(t => t.SubType)
            .Select(t => new DocumentNumberingTemplateDto
            {
                Id = t.Id,
                CompanyId = t.CompanyId,
                DocumentType = t.DocumentType,
                SubType = t.SubType,
                Template = t.Template,
                Prefix = t.Prefix,
                IncludeYear = t.IncludeYear,
                YearFormat = t.YearFormat,
                IncludeMonth = t.IncludeMonth,
                MonthFormat = t.MonthFormat,
                SequenceLength = t.SequenceLength,
                StartingNumber = t.StartingNumber,
                CurrentSequence = t.CurrentSequence,
                ResetFrequency = t.ResetFrequency,
                ResetFrequencyName = GetResetFrequencyName(t.ResetFrequency),
                LastResetDate = t.LastResetDate,
                ExampleOutput = t.ExampleOutput,
                IsActive = t.IsActive
            })
            .ToListAsync(cancellationToken);

        return Result<List<DocumentNumberingTemplateDto>>.Ok(templates);
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

