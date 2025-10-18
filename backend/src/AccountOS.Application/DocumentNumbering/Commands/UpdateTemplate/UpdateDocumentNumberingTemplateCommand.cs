using AccountOS.Application.Common;
using AccountOS.Application.DocumentNumbering.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.DocumentNumbering.Commands.UpdateTemplate;

public record UpdateDocumentNumberingTemplateCommand : IRequest<Result<DocumentNumberingTemplateDto>>
{
    public Guid Id { get; init; }
    public string Template { get; init; } = string.Empty;
    public string Prefix { get; init; } = string.Empty;
    public bool IncludeYear { get; init; }
    public string YearFormat { get; init; } = "YYYY";
    public bool IncludeMonth { get; init; }
    public string MonthFormat { get; init; } = "MM";
    public int SequenceLength { get; init; }
    public ResetFrequency ResetFrequency { get; init; }
    public bool IsActive { get; init; }
}

