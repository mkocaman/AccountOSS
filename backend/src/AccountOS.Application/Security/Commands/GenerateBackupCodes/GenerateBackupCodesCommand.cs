using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.GenerateBackupCodes;

public record GenerateBackupCodesCommand : IRequest<Result<string[]>>;

