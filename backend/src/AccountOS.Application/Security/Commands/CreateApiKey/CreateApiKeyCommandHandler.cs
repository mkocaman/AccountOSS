using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using MediatR;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AccountOS.Application.Security.Commands.CreateApiKey;

public class CreateApiKeyCommandHandler 
    : IRequestHandler<CreateApiKeyCommand, Result<CreateApiKeyResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateApiKeyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CreateApiKeyResult>> Handle(
        CreateApiKeyCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<CreateApiKeyResult>.Fail("Kullanıcı bilgisi bulunamadı");

        // API key oluştur
        var apiKey = GenerateApiKey();
        var keyHash = HashApiKey(apiKey);
        var keyPrefix = apiKey[..8];

        var apiKeyEntity = new ApiKey
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId.Value,
            Name = request.Name,
            Description = request.Description,
            KeyHash = keyHash,
            KeyPrefix = keyPrefix,
            Permissions = request.Permissions != null && request.Permissions.Any()
                ? JsonSerializer.Serialize(request.Permissions)
                : null,
            RateLimitPerMinute = request.RateLimitPerMinute,
            ExpiresAt = request.ExpiresAt,
            AllowedIps = request.AllowedIps != null && request.AllowedIps.Any()
                ? JsonSerializer.Serialize(request.AllowedIps)
                : null,
            IsActive = true,
            UsageCount = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId.Value
        };

        _context.ApiKeys.Add(apiKeyEntity);
        await _context.SaveChangesAsync(cancellationToken);

        var result = new CreateApiKeyResult
        {
            Id = apiKeyEntity.Id,
            Name = apiKeyEntity.Name,
            ApiKey = apiKey,
            KeyPrefix = keyPrefix,
            CreatedAt = apiKeyEntity.CreatedAt
        };

        return Result<CreateApiKeyResult>.Ok(result);
    }

    private string GenerateApiKey()
    {
        // Format: acc_os_[32 random chars]
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new char[32];
        
        for (int i = 0; i < 32; i++)
        {
            random[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
        }

        return $"acc_os_{new string(random)}";
    }

    private string HashApiKey(string apiKey)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(apiKey);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}

