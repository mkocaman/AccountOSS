using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Products.Commands.DeleteProduct;

/// <summary>
/// Ürün silme komut işleyicisi
/// </summary>
public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteProductCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<bool>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Ürün var mı?
        var product = await _context.Products
            .Where(p => p.Id == request.Id && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (product == null)
            return Result<bool>.Fail("Ürün bulunamadı");

        // Soft delete
        product.IsDeleted = true;
        product.DeletedAt = DateTime.UtcNow;
        product.DeletedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

