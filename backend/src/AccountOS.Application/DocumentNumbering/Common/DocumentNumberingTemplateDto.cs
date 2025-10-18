using AccountOS.Domain.Enums;

namespace AccountOS.Application.DocumentNumbering.Common;

public record DocumentNumberingTemplateDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string DocumentType { get; init; } = string.Empty;
    public string? SubType { get; init; }
    public string Template { get; init; } = string.Empty;
    public string Prefix { get; init; } = string.Empty;
    public bool IncludeYear { get; init; }
    public string YearFormat { get; init; } = string.Empty;
    public bool IncludeMonth { get; init; }
    public string MonthFormat { get; init; } = string.Empty;
    public int SequenceLength { get; init; }
    public int StartingNumber { get; init; }
    public int CurrentSequence { get; init; }
    public ResetFrequency ResetFrequency { get; init; }
    public string ResetFrequencyName { get; init; } = string.Empty;
    public DateTime? LastResetDate { get; init; }
    public string ExampleOutput { get; init; } = string.Empty;
    public bool IsActive { get; init; }
}

