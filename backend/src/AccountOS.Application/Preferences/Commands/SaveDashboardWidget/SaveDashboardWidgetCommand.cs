using AccountOS.Application.Common;
using AccountOS.Application.Preferences.Common;
using MediatR;

namespace AccountOS.Application.Preferences.Commands.SaveDashboardWidget;

public record SaveDashboardWidgetCommand : IRequest<Result<DashboardWidgetDto>>
{
    public Guid? Id { get; init; }
    public string WidgetType { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Settings { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }
    public int Width { get; init; } = 4;
    public int Height { get; init; } = 3;
    public bool IsVisible { get; init; } = true;
    public int Order { get; init; }
}

