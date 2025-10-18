using AccountOS.Application.Common;
using AccountOS.Application.DocumentNumbering.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.DocumentNumbering.Commands.CreateTemplate;

public record CreateDocumentNumberingTemplateCommand : IRequest<Result<DocumentNumberingTemplateDto>>
{
    public string DocumentType { get; init; } = string.Empty;
    public string? SubType { get; init; }
    public string Template { get; init; } = string.Empty;
    public string Prefix { get; init; } = string.Empty;
    public bool IncludeYear { get; init; }
    public string YearFormat { get; init; } = "YYYY";
    public bool IncludeMonth { get; init; }
    public string MonthFormat { get; init; } = "MM";
    public int SequenceLength { get; init; }
    public int StartingNumber { get; init; } = 1;
    public ResetFrequency ResetFrequency { get; init; }
}

