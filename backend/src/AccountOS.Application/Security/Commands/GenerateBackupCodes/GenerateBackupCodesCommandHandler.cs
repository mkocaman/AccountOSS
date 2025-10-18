using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Security.Commands.GenerateBackupCodes;

public class GenerateBackupCodesCommandHandler 
    : IRequestHandler<GenerateBackupCodesCommand, Result<string[]>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly ITwoFactorAuthService _twoFactorAuthService;

    public GenerateBackupCodesCommandHandler(
        ICurrentUserService currentUser,
        ITwoFactorAuthService twoFactorAuthService)
    {
        _currentUser = currentUser;
        _twoFactorAuthService = twoFactorAuthService;
    }

    public async Task<Result<string[]>> Handle(
        GenerateBackupCodesCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.UserId == null)
            return Result<string[]>.Fail("Kullanıcı bilgisi bulunamadı");

        var backupCodes = await _twoFactorAuthService.GenerateNewBackupCodesAsync(
            _currentUser.UserId.Value,
            cancellationToken);

        if (backupCodes.Length == 0)
            return Result<string[]>.Fail("Backup kodları oluşturulamadı");

        return Result<string[]>.Ok(backupCodes);
    }
}

