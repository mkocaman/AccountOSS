using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Email.Configuration.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Email.Configuration.Commands.SaveEmailConfiguration;

public class SaveEmailConfigurationCommandHandler 
    : IRequestHandler<SaveEmailConfigurationCommand, Result<EmailConfigurationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SaveEmailConfigurationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<EmailConfigurationDto>> Handle(
        SaveEmailConfigurationCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<EmailConfigurationDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        Domain.Entities.EmailConfiguration config;

        if (request.Id.HasValue)
        {
            // Update existing
            config = await _context.EmailConfigurations
                .Where(c => c.Id == request.Id.Value && c.CompanyId == companyId)
                .FirstOrDefaultAsync(cancellationToken);

            if (config == null)
                return Result<EmailConfigurationDto>.Fail("Email yapılandırması bulunamadı");

            config.SmtpHost = request.SmtpHost;
            config.SmtpPort = request.SmtpPort;
            config.UseSsl = request.UseSsl;
            config.Username = request.Username;
            
            // Şifre değiştirilmişse güncelle
            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                config.Password = request.Password; // TODO: Encrypt
            }

            config.SenderName = request.SenderName;
            config.SenderEmail = request.SenderEmail;
            config.DefaultCc = request.DefaultCc;
            config.DefaultBcc = request.DefaultBcc;
            config.UpdatedAt = DateTime.UtcNow;
            config.UpdatedBy = _currentUser.UserId ?? Guid.Empty;
        }
        else
        {
            // Create new
            config = new Domain.Entities.EmailConfiguration
            {
                Id = Guid.NewGuid(),
                CompanyId = companyId,
                SmtpHost = request.SmtpHost,
                SmtpPort = request.SmtpPort,
                UseSsl = request.UseSsl,
                Username = request.Username,
                Password = request.Password, // TODO: Encrypt
                SenderName = request.SenderName,
                SenderEmail = request.SenderEmail,
                DefaultCc = request.DefaultCc,
                DefaultBcc = request.DefaultBcc,
                IsActive = true,
                IsTested = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser.UserId ?? Guid.Empty
            };

            _context.EmailConfigurations.Add(config);
        }

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new EmailConfigurationDto
        {
            Id = config.Id,
            CompanyId = config.CompanyId,
            SmtpHost = config.SmtpHost,
            SmtpPort = config.SmtpPort,
            UseSsl = config.UseSsl,
            Username = config.Username,
            SenderName = config.SenderName,
            SenderEmail = config.SenderEmail,
            DefaultCc = config.DefaultCc,
            DefaultBcc = config.DefaultBcc,
            IsActive = config.IsActive,
            IsTested = config.IsTested,
            LastTestedAt = config.LastTestedAt
        };

        return Result<EmailConfigurationDto>.Ok(dto);
    }
}

