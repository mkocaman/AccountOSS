namespace AccountOS.Application.Preferences.Common;

public record DashboardWidgetDto
{
    public Guid Id { get; init; }
    public string WidgetType { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Settings { get; init; }
    public int PositionX { get; init; }
    public int PositionY { get; init; }
    public int Width { get; init; }
    public int Height { get; init; }
    public bool IsVisible { get; init; }
    public int Order { get; init; }
}

