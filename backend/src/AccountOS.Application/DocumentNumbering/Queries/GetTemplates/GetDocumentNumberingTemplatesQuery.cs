using AccountOS.Application.Common;
using AccountOS.Application.DocumentNumbering.Common;
using MediatR;

namespace AccountOS.Application.DocumentNumbering.Queries.GetTemplates;

public record GetDocumentNumberingTemplatesQuery : IRequest<Result<List<DocumentNumberingTemplateDto>>>
{
    public string? DocumentType { get; init; }
    public bool? IsActive { get; init; }
}

