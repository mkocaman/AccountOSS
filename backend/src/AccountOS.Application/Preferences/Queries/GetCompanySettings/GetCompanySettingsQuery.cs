using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using MediatR;

namespace AccountOS.Application.Preferences.Queries.GetCompanySettings;

public record GetCompanySettingsQuery : IRequest<Result<CompanySettingsDto>>;

