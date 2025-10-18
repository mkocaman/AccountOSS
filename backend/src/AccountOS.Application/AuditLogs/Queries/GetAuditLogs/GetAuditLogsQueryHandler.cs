using AccountOS.Application.AuditLogs.Common;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.AuditLogs.Queries.GetAuditLogs;

public class GetAuditLogsQueryHandler 
    : IRequestHandler<GetAuditLogsQuery, Result<List<AuditLogDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetAuditLogsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<AuditLogDto>>> Handle(
        GetAuditLogsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<AuditLogDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.AuditLogs
            .Where(a => a.CompanyId == companyId || a.CompanyId == null); // Include login logs

        // Filters
        if (request.Action.HasValue)
            query = query.Where(a => a.Action == request.Action.Value);

        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(a => a.EntityType == request.EntityType);

        if (!string.IsNullOrWhiteSpace(request.EntityId))
            query = query.Where(a => a.EntityId == request.EntityId);

        if (request.UserId.HasValue)
            query = query.Where(a => a.UserId == request.UserId.Value);

        if (request.StartDate.HasValue)
            query = query.Where(a => a.Timestamp >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(a => a.Timestamp <= request.EndDate.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(a =>
                a.UserName.ToLower().Contains(searchTerm) ||
                a.UserEmail.ToLower().Contains(searchTerm) ||
                a.EntityType.ToLower().Contains(searchTerm) ||
                (a.EntityName != null && a.EntityName.ToLower().Contains(searchTerm)) ||
                (a.Description != null && a.Description.ToLower().Contains(searchTerm)));
        }

        // Pagination
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
            AuditAction.Login => "Giriş Yapıldı",
            AuditAction.Logout => "Çıkış Yapıldı",
            AuditAction.LoginFailed => "Başarısız Giriş",
            AuditAction.PasswordChanged => "Şifre Değiştirildi",
            AuditAction.PasswordReset => "Şifre Sıfırlandı",
            AuditAction.EmailSent => "Email Gönderildi",
            AuditAction.PdfGenerated => "PDF Oluşturuldu",
            AuditAction.ReportGenerated => "Rapor Oluşturuldu",
            AuditAction.FileUploaded => "Dosya Yüklendi",
            AuditAction.FileDownloaded => "Dosya İndirildi",
            AuditAction.BulkOperation => "Toplu İşlem",
            AuditAction.Import => "İçe Aktarma",
            AuditAction.Export => "Dışa Aktarma",
            AuditAction.Custom => "Özel İşlem",
            _ => action.ToString()
        };
    }
}

