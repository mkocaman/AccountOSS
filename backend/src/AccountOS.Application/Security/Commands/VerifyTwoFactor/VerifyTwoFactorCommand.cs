using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.VerifyTwoFactor;

public record VerifyTwoFactorCommand : IRequest<Result<bool>>
{
    public string Code { get; init; } = string.Empty;
    public bool IsBackupCode { get; init; }
}

