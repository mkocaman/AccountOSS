using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using MediatR;

namespace AccountOS.Application.Preferences.Queries.GetUserPreference;

public record GetUserPreferenceQuery : IRequest<Result<UserPreferenceDto>>;

