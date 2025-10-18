using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Email.Configuration.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Email.Configuration.Queries.GetEmailConfiguration;

public class GetEmailConfigurationQueryHandler 
    : IRequestHandler<GetEmailConfigurationQuery, Result<EmailConfigurationDto?>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetEmailConfigurationQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<EmailConfigurationDto?>> Handle(
        GetEmailConfigurationQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<EmailConfigurationDto?>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var config = await _context.EmailConfigurations
            .Where(c => c.CompanyId == companyId && c.IsActive)
            .Select(c => new EmailConfigurationDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                SmtpHost = c.SmtpHost,
                SmtpPort = c.SmtpPort,
                UseSsl = c.UseSsl,
                Username = c.Username,
                SenderName = c.SenderName,
                SenderEmail = c.SenderEmail,
                DefaultCc = c.DefaultCc,
                DefaultBcc = c.DefaultBcc,
                IsActive = c.IsActive,
                IsTested = c.IsTested,
                LastTestedAt = c.LastTestedAt
            })
            .FirstOrDefaultAsync(cancellationToken);

        return Result<EmailConfigurationDto?>.Ok(config);
    }
}

