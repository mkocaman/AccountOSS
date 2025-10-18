using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using QRCoder;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Two-Factor Authentication service implementation
/// </summary>
public class TwoFactorAuthService : ITwoFactorAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<TwoFactorAuthService> _logger;
    private const string Issuer = "AccountOS";

    public TwoFactorAuthService(
        IApplicationDbContext context,
        ILogger<TwoFactorAuthService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<(string SecretKey, string QrCodeDataUrl, string ManualEntryKey, string[] BackupCodes)> EnableTwoFactorAsync(
        Guid userId,
        string userEmail,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Secret key oluştur
            var secretKey = GenerateSecretKey();
            var base32Secret = Base32Encoding.ToString(secretKey);

            // QR code data URL oluştur
            var qrCodeUrl = GenerateQrCodeDataUrl(userEmail, base32Secret);

            // Backup codes oluştur
            var backupCodes = GenerateBackupCodes(10);

            // Veritabanına kaydet
            var twoFactorAuth = await _context.TwoFactorAuths
                .Where(t => t.UserId == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (twoFactorAuth == null)
            {
                twoFactorAuth = new TwoFactorAuth
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    IsEnabled = true,
                    SecretKey = Convert.ToBase64String(secretKey), // TODO: AES encryption
                    BackupCodes = JsonSerializer.Serialize(backupCodes), // TODO: AES encryption
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = userId
                };
                _context.TwoFactorAuths.Add(twoFactorAuth);
            }
            else
            {
                twoFactorAuth.IsEnabled = true;
                twoFactorAuth.SecretKey = Convert.ToBase64String(secretKey);
                twoFactorAuth.BackupCodes = JsonSerializer.Serialize(backupCodes);
                twoFactorAuth.FailedAttempts = 0;
                twoFactorAuth.LockedUntil = null;
                twoFactorAuth.UpdatedAt = DateTime.UtcNow;
                twoFactorAuth.UpdatedBy = userId;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("2FA enabled for user {UserId}", userId);

            return (base32Secret, qrCodeUrl, base32Secret, backupCodes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error enabling 2FA for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> VerifyTotpCodeAsync(
        Guid userId,
        string code,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var twoFactorAuth = await _context.TwoFactorAuths
                .Where(t => t.UserId == userId && t.IsEnabled)
                .FirstOrDefaultAsync(cancellationToken);

            if (twoFactorAuth == null || string.IsNullOrWhiteSpace(twoFactorAuth.SecretKey))
                return false;

            // Lockout kontrolü
            if (twoFactorAuth.LockedUntil.HasValue && twoFactorAuth.LockedUntil.Value > DateTime.UtcNow)
            {
                _logger.LogWarning("2FA locked for user {UserId} until {LockedUntil}", userId, twoFactorAuth.LockedUntil);
                return false;
            }

            // Secret key'i decode et
            var secretBytes = Convert.FromBase64String(twoFactorAuth.SecretKey);
            var totp = new Totp(secretBytes);

            // Kodu doğrula (±1 time step tolerance)
            var isValid = totp.VerifyTotp(code, out _, new VerificationWindow(1, 1));

            if (isValid)
            {
                // Başarılı doğrulama
                twoFactorAuth.LastVerifiedAt = DateTime.UtcNow;
                twoFactorAuth.FailedAttempts = 0;
                twoFactorAuth.LockedUntil = null;
                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("2FA code verified for user {UserId}", userId);
                return true;
            }
            else
            {
                // Başarısız doğrulama
                twoFactorAuth.FailedAttempts++;

                // 5 başarısız denemeden sonra 15 dakika kilitle
                if (twoFactorAuth.FailedAttempts >= 5)
                {
                    twoFactorAuth.LockedUntil = DateTime.UtcNow.AddMinutes(15);
                    _logger.LogWarning("2FA locked for user {UserId} after {Attempts} failed attempts", 
                        userId, twoFactorAuth.FailedAttempts);
                }

                await _context.SaveChangesAsync(cancellationToken);

                _logger.LogWarning("Invalid 2FA code for user {UserId}", userId);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying TOTP code for user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> VerifyBackupCodeAsync(
        Guid userId,
        string code,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var twoFactorAuth = await _context.TwoFactorAuths
                .Where(t => t.UserId == userId && t.IsEnabled)
                .FirstOrDefaultAsync(cancellationToken);

            if (twoFactorAuth == null || string.IsNullOrWhiteSpace(twoFactorAuth.BackupCodes))
                return false;

            var backupCodes = JsonSerializer.Deserialize<string[]>(twoFactorAuth.BackupCodes);
            if (backupCodes == null || !backupCodes.Contains(code))
                return false;

            // Backup code'u kullanıldı olarak işaretle (listeden çıkar)
            var remainingCodes = backupCodes.Where(c => c != code).ToArray();
            twoFactorAuth.BackupCodes = JsonSerializer.Serialize(remainingCodes);
            twoFactorAuth.LastVerifiedAt = DateTime.UtcNow;
            twoFactorAuth.FailedAttempts = 0;
            twoFactorAuth.UpdatedAt = DateTime.UtcNow;
            twoFactorAuth.UpdatedBy = userId;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Backup code used for user {UserId}. Remaining: {Count}", userId, remainingCodes.Length);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying backup code for user {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> DisableTwoFactorAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var twoFactorAuth = await _context.TwoFactorAuths
                .Where(t => t.UserId == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (twoFactorAuth == null)
                return false;

            twoFactorAuth.IsEnabled = false;
            twoFactorAuth.UpdatedAt = DateTime.UtcNow;
            twoFactorAuth.UpdatedBy = userId;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("2FA disabled for user {UserId}", userId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error disabling 2FA for user {UserId}", userId);
            return false;
        }
    }

    public async Task<string[]> GenerateNewBackupCodesAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var twoFactorAuth = await _context.TwoFactorAuths
                .Where(t => t.UserId == userId && t.IsEnabled)
                .FirstOrDefaultAsync(cancellationToken);

            if (twoFactorAuth == null)
                return Array.Empty<string>();

            var backupCodes = GenerateBackupCodes(10);
            twoFactorAuth.BackupCodes = JsonSerializer.Serialize(backupCodes);
            twoFactorAuth.UpdatedAt = DateTime.UtcNow;
            twoFactorAuth.UpdatedBy = userId;

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("New backup codes generated for user {UserId}", userId);
            return backupCodes;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating backup codes for user {UserId}", userId);
            return Array.Empty<string>();
        }
    }

    public async Task<bool> IsTwoFactorEnabledAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var twoFactorAuth = await _context.TwoFactorAuths
            .Where(t => t.UserId == userId && t.IsEnabled)
            .FirstOrDefaultAsync(cancellationToken);

        return twoFactorAuth != null;
    }

    // Helper Methods

    private byte[] GenerateSecretKey()
    {
        // 20-byte secret (160 bits) for TOTP
        var secretKey = new byte[20];
        RandomNumberGenerator.Fill(secretKey);
        return secretKey;
    }

    private string[] GenerateBackupCodes(int count)
    {
        var codes = new string[count];
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for (int i = 0; i < count; i++)
        {
            var code = new char[8];
            for (int j = 0; j < 8; j++)
            {
                code[j] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
            }
            codes[i] = new string(code);
        }

        return codes;
    }

    private string GenerateQrCodeDataUrl(string userEmail, string base32Secret)
    {
        try
        {
            // TOTP URI format: otpauth://totp/AccountOS:user@example.com?secret=XXX&issuer=AccountOS
            var totpUri = $"otpauth://totp/{Issuer}:{userEmail}?secret={base32Secret}&issuer={Issuer}";

            using var qrGenerator = new QRCodeGenerator();
            using var qrCodeData = qrGenerator.CreateQrCode(totpUri, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new PngByteQRCode(qrCodeData);
            
            var qrCodeImage = qrCode.GetGraphic(20);
            var base64Image = Convert.ToBase64String(qrCodeImage);

            return $"data:image/png;base64,{base64Image}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating QR code");
            return string.Empty;
        }
    }
}

