using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Security.Commands.DisableTwoFactor;

public record DisableTwoFactorCommand : IRequest<Result<bool>>;

