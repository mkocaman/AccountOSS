using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.AuditLogs.Queries.GetUserActivity;

public class GetUserActivityQueryHandler 
    : IRequestHandler<GetUserActivityQuery, Result<List<AuditLogDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetUserActivityQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<AuditLogDto>>> Handle(
        GetUserActivityQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<AuditLogDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Eğer userId belirtilmemişse, current user'ın aktivitelerini getir
        var userId = request.UserId ?? _currentUser.UserId;

        if (userId == null)
            return Result<List<AuditLogDto>>.Fail("Kullanıcı ID bulunamadı");

        var query = _context.AuditLogs
            .Where(a => a.UserId == userId.Value
                     && (a.CompanyId == companyId || a.CompanyId == null));

        if (request.StartDate.HasValue)
            query = query.Where(a => a.Timestamp >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(a => a.Timestamp <= request.EndDate.Value);

        var skip = (request.PageNumber - 1) * request.PageSize;

        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip(skip)
            .Take(request.PageSize)
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
                Description = a.Description,
                IpAddress = a.IpAddress,
                Timestamp = a.Timestamp,
                HttpMethod = a.HttpMethod,
                RequestPath = a.RequestPath,
                StatusCode = a.StatusCode
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
            AuditAction.Login => "Giriş",
            AuditAction.Logout => "Çıkış",
            _ => action.ToString()
        };
    }
}

