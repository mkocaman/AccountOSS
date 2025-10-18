using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Security.Commands.EnableTwoFactor;

public class EnableTwoFactorCommandHandler 
    : IRequestHandler<EnableTwoFactorCommand, Result<Enable2FaResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ITwoFactorAuthService _twoFactorAuthService;

    public EnableTwoFactorCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ITwoFactorAuthService twoFactorAuthService)
    {
        _context = context;
        _currentUser = currentUser;
        _twoFactorAuthService = twoFactorAuthService;
    }

    public async Task<Result<Enable2FaResult>> Handle(
        EnableTwoFactorCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<Enable2FaResult>.Fail("Kullanıcı bilgisi bulunamadı");

        var user = await _context.Users
            .Where(u => u.Id == _currentUser.UserId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (user == null)
            return Result<Enable2FaResult>.Fail("Kullanıcı bulunamadı");

        var (secretKey, qrCodeUrl, manualKey, backupCodes) = await _twoFactorAuthService.EnableTwoFactorAsync(
            _currentUser.UserId.Value,
            user.Email,
            cancellationToken);

        var result = new Enable2FaResult
        {
            QrCodeDataUrl = qrCodeUrl,
            ManualEntryKey = manualKey,
            BackupCodes = backupCodes
        };

        return Result<Enable2FaResult>.Ok(result);
    }
}

