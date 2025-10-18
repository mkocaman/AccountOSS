using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.AuditLogs.Queries.GetEntityHistory;

public class GetEntityHistoryQueryHandler 
    : IRequestHandler<GetEntityHistoryQuery, Result<List<AuditLogDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetEntityHistoryQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<AuditLogDto>>> Handle(
        GetEntityHistoryQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<AuditLogDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var logs = await _context.AuditLogs
            .Where(a => a.CompanyId == companyId
                     && a.EntityType == request.EntityType
                     && a.EntityId == request.EntityId)
            .OrderByDescending(a => a.Timestamp)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                CompanyId = a.CompanyId,
                UserId = a.UserId,
                UserName = a.UserName,
                UserEmail = a.UserEmail,
                Action = a.Action,
                ActionName = GetActionName(a.Action),
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                EntityName = a.EntityName,
                OldValues = a.OldValues,
                NewValues = a.NewValues,
                ChangedProperties = a.ChangedProperties,
                Description = a.Description,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                Timestamp = a.Timestamp,
                HttpMethod = a.HttpMethod,
                RequestPath = a.RequestPath,
                StatusCode = a.StatusCode,
                Duration = a.Duration,
                ErrorMessage = a.ErrorMessage
            })
            .ToListAsync(cancellationToken);

        return Result<List<AuditLogDto>>.Ok(logs);
    }

    private static string GetActionName(AuditAction action)
    {
        return action switch
        {
            AuditAction.Create => "Oluşturuldu",
            AuditAction.Update => "Güncellendi",
            AuditAction.Delete => "Silindi",
            AuditAction.View => "Görüntülendi",
            AuditAction.Restore => "Geri Yüklendi",
            _ => action.ToString()
        };
    }
}

