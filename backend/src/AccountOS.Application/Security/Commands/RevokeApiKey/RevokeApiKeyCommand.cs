using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.RevokeApiKey;

public record RevokeApiKeyCommand(Guid ApiKeyId) : IRequest<Result<bool>>;

