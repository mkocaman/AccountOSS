using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.CreateApiKey;

public record CreateApiKeyCommand : IRequest<Result<CreateApiKeyResult>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public List<string>? Permissions { get; init; }
    public int RateLimitPerMinute { get; init; } = 60;
    public DateTime? ExpiresAt { get; init; }
    public List<string>? AllowedIps { get; init; }
}

public record CreateApiKeyResult
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string ApiKey { get; init; } = string.Empty;
    public string KeyPrefix { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

