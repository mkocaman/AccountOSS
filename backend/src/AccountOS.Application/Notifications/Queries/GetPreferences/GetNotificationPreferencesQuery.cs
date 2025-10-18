using AccountOS.Application.Common;
using AccountOS.Application.Notifications.Common;
using MediatR;

namespace AccountOS.Application.Notifications.Queries.GetPreferences;

public record GetNotificationPreferencesQuery : IRequest<Result<List<NotificationPreferenceDto>>>;

