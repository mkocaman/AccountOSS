using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.EnableTwoFactor;

public record EnableTwoFactorCommand : IRequest<Result<Enable2FaResult>>;

public record Enable2FaResult
{
    public string QrCodeDataUrl { get; init; } = string.Empty;
    public string ManualEntryKey { get; init; } = string.Empty;
    public string[] BackupCodes { get; init; } = Array.Empty<string>();
}

