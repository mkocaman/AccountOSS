using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Preferences.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Queries.GetDashboardWidgets;

public class GetDashboardWidgetsQueryHandler 
    : IRequestHandler<GetDashboardWidgetsQuery, Result<List<DashboardWidgetDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetDashboardWidgetsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<DashboardWidgetDto>>> Handle(
        GetDashboardWidgetsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<List<DashboardWidgetDto>>.Fail("Kullanıcı bilgisi bulunamadı");

        var widgets = await _context.DashboardWidgets
            .Where(w => w.UserId == _currentUser.UserId.Value && w.IsVisible)
            .OrderBy(w => w.Order)
            .Select(w => new DashboardWidgetDto
            {
                Id = w.Id,
                WidgetType = w.WidgetType,
                Title = w.Title,
                Settings = w.Settings,
                PositionX = w.PositionX,
                PositionY = w.PositionY,
                Width = w.Width,
                Height = w.Height,
                IsVisible = w.IsVisible,
                Order = w.Order
            })
            .ToListAsync(cancellationToken);

        return Result<List<DashboardWidgetDto>>.Ok(widgets);
    }
}

