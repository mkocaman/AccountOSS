using MediatR;
using Microsoft.EntityFrameworkCore;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Application.Features.Authentication.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<Result<LoginResponse>> Handle(
        LoginCommand request, 
        CancellationToken cancellationToken)
    {
        // Kullanıcı bul
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (user == null)
        {
            return Result<LoginResponse>.Fail("Email veya şifre hatalı");
        }

        // Aktif mi kontrol et
        if (!user.IsActive)
        {
            return Result<LoginResponse>.Fail("Hesabınız aktif değil");
        }

        // Şifre kontrolü
        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Result<LoginResponse>.Fail("Email veya şifre hatalı");
        }

        // Rolleri al
        var roles = user.UserRoles.Select(ur => ur.RoleName).ToList();
        if (!roles.Any())
        {
            roles.Add("User"); // Varsayılan rol
        }

        // JWT token üret
        var accessToken = _jwtService.GenerateAccessToken(
            user.Id, 
            user.Email, 
            roles);
        
        var refreshToken = _jwtService.GenerateRefreshToken();

        // Son giriş zamanını güncelle
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var response = new LoginResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        return Result<LoginResponse>.Ok(response);
    }
}

