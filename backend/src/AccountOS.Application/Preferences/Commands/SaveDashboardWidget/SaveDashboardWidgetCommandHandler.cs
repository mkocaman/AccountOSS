using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using AccountOS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Commands.SaveDashboardWidget;

public class SaveDashboardWidgetCommandHandler 
    : IRequestHandler<SaveDashboardWidgetCommand, Result<DashboardWidgetDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SaveDashboardWidgetCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<DashboardWidgetDto>> Handle(
        SaveDashboardWidgetCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<DashboardWidgetDto>.Fail("Kullanıcı bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;

        DashboardWidget widget;

        if (request.Id.HasValue)
        {
            // Update existing
            widget = await _context.DashboardWidgets
                .Where(w => w.Id == request.Id.Value && w.UserId == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (widget == null)
                return Result<DashboardWidgetDto>.Fail("Widget bulunamadı");

            widget.Title = request.Title;
            widget.Settings = request.Settings;
            widget.PositionX = request.PositionX;
            widget.PositionY = request.PositionY;
            widget.Width = request.Width;
            widget.Height = request.Height;
            widget.IsVisible = request.IsVisible;
            widget.Order = request.Order;
            widget.UpdatedAt = DateTime.UtcNow;
            widget.UpdatedBy = userId;
        }
        else
        {
            // Create new
            widget = new DashboardWidget
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                WidgetType = request.WidgetType,
                Title = request.Title,
                Settings = request.Settings,
                PositionX = request.PositionX,
                PositionY = request.PositionY,
                Width = request.Width,
                Height = request.Height,
                IsVisible = request.IsVisible,
                Order = request.Order,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };

            _context.DashboardWidgets.Add(widget);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new DashboardWidgetDto
        {
            Id = widget.Id,
            WidgetType = widget.WidgetType,
            Title = widget.Title,
            Settings = widget.Settings,
            PositionX = widget.PositionX,
            PositionY = widget.PositionY,
            Width = widget.Width,
            Height = widget.Height,
            IsVisible = widget.IsVisible,
            Order = widget.Order
        };

        return Result<DashboardWidgetDto>.Ok(dto);
    }
}

