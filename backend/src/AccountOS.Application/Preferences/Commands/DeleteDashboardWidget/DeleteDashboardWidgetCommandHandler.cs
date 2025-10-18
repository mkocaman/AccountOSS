using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Preferences.Commands.DeleteDashboardWidget;

public class DeleteDashboardWidgetCommandHandler 
    : IRequestHandler<DeleteDashboardWidgetCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteDashboardWidgetCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        DeleteDashboardWidgetCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var widget = await _context.DashboardWidgets
            .Where(w => w.Id == request.WidgetId && w.UserId == _currentUser.UserId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (widget == null)
            return Result<bool>.Fail("Widget bulunamadı");

        _context.DashboardWidgets.Remove(widget);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

