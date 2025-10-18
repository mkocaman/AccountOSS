using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Email.Queries.GetEmailLogs;

public class GetEmailLogsQueryHandler 
    : IRequestHandler<GetEmailLogsQuery, Result<List<EmailLogDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetEmailLogsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<EmailLogDto>>> Handle(
        GetEmailLogsQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<EmailLogDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.EmailLogs
            .Where(l => l.CompanyId == companyId);

        // Filters
        if (request.Status.HasValue)
            query = query.Where(l => l.Status == request.Status.Value);

        if (request.StartDate.HasValue)
            query = query.Where(l => l.CreatedAt >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(l => l.CreatedAt <= request.EndDate.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(l => 
                l.ToEmail.ToLower().Contains(searchTerm) ||
                (l.ToName != null && l.ToName.ToLower().Contains(searchTerm)) ||
                l.Subject.ToLower().Contains(searchTerm));
        }

        // Pagination
        var skip = (request.PageNumber - 1) * request.PageSize;

        var logs = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(l => new EmailLogDto
            {
                Id = l.Id,
                ToEmail = l.ToEmail,
                ToName = l.ToName,
                Subject = l.Subject,
                Status = l.Status,
                StatusName = GetStatusName(l.Status),
                AttemptCount = l.AttemptCount,
                SentAt = l.SentAt,
                ErrorMessage = l.ErrorMessage,
                CreatedAt = l.CreatedAt,
                NextRetryAt = l.NextRetryAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<EmailLogDto>>.Ok(logs);
    }

    private static string GetStatusName(EmailStatus status)
    {
        return status switch
        {
            EmailStatus.Pending => "Bekliyor",
            EmailStatus.Sending => "Gönderiliyor",
            EmailStatus.Sent => "Gönderildi",
            EmailStatus.Failed => "Başarısız",
            EmailStatus.Retry => "Tekrar Denenecek",
            EmailStatus.PermanentFailure => "Kalıcı Hata",
            _ => status.ToString()
        };
    }
}

