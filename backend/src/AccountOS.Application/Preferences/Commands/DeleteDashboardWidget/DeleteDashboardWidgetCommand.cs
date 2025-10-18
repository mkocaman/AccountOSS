using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Preferences.Commands.DeleteDashboardWidget;

public record DeleteDashboardWidgetCommand(Guid WidgetId) : IRequest<Result<bool>>;

