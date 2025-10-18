using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Email.Configuration.Commands.TestEmailConfiguration;

public class TestEmailConfigurationCommandHandler 
    : IRequestHandler<TestEmailConfigurationCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IEmailService _emailService;

    public TestEmailConfigurationCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IEmailService emailService)
    {
        _context = context;
        _currentUser = currentUser;
        _emailService = emailService;
    }

    public async Task<Result<bool>> Handle(
        TestEmailConfigurationCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<bool>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Test email gönder
        var success = await _emailService.SendTestEmailAsync(request.TestEmail, cancellationToken);

        if (success)
        {
            // Config'i tested olarak işaretle
            var config = await _context.EmailConfigurations
                .Where(c => c.CompanyId == companyId && c.IsActive)
                .FirstOrDefaultAsync(cancellationToken);

            if (config != null)
            {
                config.IsTested = true;
                config.LastTestedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }

            return Result<bool>.Ok(true);
        }

        return Result<bool>.Fail("Test email gönderilemedi. SMTP ayarlarını kontrol edin.");
    }
}

