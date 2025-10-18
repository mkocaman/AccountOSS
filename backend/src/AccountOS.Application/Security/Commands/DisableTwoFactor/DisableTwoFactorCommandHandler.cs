using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Security.Commands.DisableTwoFactor;

public class DisableTwoFactorCommandHandler 
    : IRequestHandler<DisableTwoFactorCommand, Result<bool>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly ITwoFactorAuthService _twoFactorAuthService;

    public DisableTwoFactorCommandHandler(
        ICurrentUserService currentUser,
        ITwoFactorAuthService twoFactorAuthService)
    {
        _currentUser = currentUser;
        _twoFactorAuthService = twoFactorAuthService;
    }

    public async Task<Result<bool>> Handle(
        DisableTwoFactorCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var success = await _twoFactorAuthService.DisableTwoFactorAsync(
            _currentUser.UserId.Value,
            cancellationToken);

        if (!success)
            return Result<bool>.Fail("2FA devre dışı bırakılamadı");

        return Result<bool>.Ok(true);
    }
}

