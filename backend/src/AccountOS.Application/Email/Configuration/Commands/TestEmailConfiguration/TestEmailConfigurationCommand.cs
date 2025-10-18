using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Email.Configuration.Commands.TestEmailConfiguration;

public record TestEmailConfigurationCommand(string TestEmail) : IRequest<Result<bool>>;

