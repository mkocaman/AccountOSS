using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Security.Commands.RevokeApiKey;

public class RevokeApiKeyCommandHandler 
    : IRequestHandler<RevokeApiKeyCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public RevokeApiKeyCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        RevokeApiKeyCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var apiKey = await _context.ApiKeys
            .Where(a => a.Id == request.ApiKeyId && a.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (apiKey == null)
            return Result<bool>.Fail("API key bulunamadı");

        apiKey.IsActive = false;
        apiKey.UpdatedAt = DateTime.UtcNow;
        apiKey.UpdatedBy = _currentUser.UserId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

