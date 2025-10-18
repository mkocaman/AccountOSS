using AccountOS.Application.Common;
using AccountOS.Application.Email.Configuration.Common;
using MediatR;

namespace AccountOS.Application.Email.Configuration.Queries.GetEmailConfiguration;

public record GetEmailConfigurationQuery : IRequest<Result<EmailConfigurationDto?>>;

