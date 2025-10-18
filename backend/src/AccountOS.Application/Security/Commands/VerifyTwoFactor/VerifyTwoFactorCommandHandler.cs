using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Security.Commands.VerifyTwoFactor;

public class VerifyTwoFactorCommandHandler 
    : IRequestHandler<VerifyTwoFactorCommand, Result<bool>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly ITwoFactorAuthService _twoFactorAuthService;

    public VerifyTwoFactorCommandHandler(
        ICurrentUserService currentUser,
        ITwoFactorAuthService twoFactorAuthService)
    {
        _currentUser = currentUser;
        _twoFactorAuthService = twoFactorAuthService;
    }

    public async Task<Result<bool>> Handle(
        VerifyTwoFactorCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        bool isValid;

        if (request.IsBackupCode)
        {
            isValid = await _twoFactorAuthService.VerifyBackupCodeAsync(
                _currentUser.UserId.Value,
                request.Code,
                cancellationToken);
        }
        else
        {
            isValid = await _twoFactorAuthService.VerifyTotpCodeAsync(
                _currentUser.UserId.Value,
                request.Code,
                cancellationToken);
        }

        if (!isValid)
            return Result<bool>.Fail("Geçersiz doğrulama kodu");

        return Result<bool>.Ok(true);
    }
}

