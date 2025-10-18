namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Two-Factor Authentication servisi
/// </summary>
public interface ITwoFactorAuthService
{
    /// <summary>
    /// 2FA'yı etkinleştir (QR code ve backup codes döner)
    /// </summary>
    Task<(string SecretKey, string QrCodeDataUrl, string ManualEntryKey, string[] BackupCodes)> EnableTwoFactorAsync(
        Guid userId,
        string userEmail,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// TOTP kodunu doğrula
    /// </summary>
    Task<bool> VerifyTotpCodeAsync(
        Guid userId,
        string code,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Backup code doğrula (tek kullanımlık)
    /// </summary>
    Task<bool> VerifyBackupCodeAsync(
        Guid userId,
        string code,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// 2FA'yı devre dışı bırak
    /// </summary>
    Task<bool> DisableTwoFactorAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Yeni backup kodları oluştur
    /// </summary>
    Task<string[]> GenerateNewBackupCodesAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Kullanıcının 2FA durumunu kontrol et
    /// </summary>
    Task<bool> IsTwoFactorEnabledAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}

