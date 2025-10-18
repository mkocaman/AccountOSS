using MediatR;
using Microsoft.EntityFrameworkCore;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;

namespace AccountOS.Application.Features.Authentication.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<RegisterResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterCommandHandler(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<RegisterResponse>> Handle(
        RegisterCommand request, 
        CancellationToken cancellationToken)
    {
        // Email kontrolü
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);

        if (existingUser != null)
        {
            return Result<RegisterResponse>.Fail("Bu email adresi zaten kullanılıyor");
        }

        // Kullanıcı oluştur
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            EmailConfirmed = false, // Email onayı eklenir
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = Guid.Empty // Self-registration
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        var response = new RegisterResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName
        };

        return Result<RegisterResponse>.Ok(response);
    }
}

