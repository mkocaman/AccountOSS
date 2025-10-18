using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Commands.CreateJournalEntry;

public record CreateJournalEntryCommand : IRequest<Result<JournalEntryDto>>
{
    public DateTime EntryDate { get; init; }
    public string Description { get; init; } = string.Empty;
    public List<JournalEntryLineCommand> Lines { get; init; } = new();
}

public record JournalEntryLineCommand
{
    public Guid AccountId { get; init; }
    public decimal DebitAmount { get; init; }
    public decimal CreditAmount { get; init; }
    public string? Description { get; init; }
}

