using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using MediatR;

namespace AccountOS.Application.Preferences.Queries.GetDashboardWidgets;

public record GetDashboardWidgetsQuery : IRequest<Result<List<DashboardWidgetDto>>>;

