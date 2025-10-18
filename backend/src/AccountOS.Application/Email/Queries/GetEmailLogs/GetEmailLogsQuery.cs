using AccountOS.Application.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Email.Queries.GetEmailLogs;

public record GetEmailLogsQuery : IRequest<Result<List<EmailLogDto>>>
{
    public EmailStatus? Status { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

public record EmailLogDto
{
    public Guid Id { get; init; }
    public string ToEmail { get; init; } = string.Empty;
    public string? ToName { get; init; }
    public string Subject { get; init; } = string.Empty;
    public EmailStatus Status { get; init; }
    public string StatusName { get; init; } = string.Empty;
    public int AttemptCount { get; init; }
    public DateTime? SentAt { get; init; }
    public string? ErrorMessage { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? NextRetryAt { get; init; }
}

