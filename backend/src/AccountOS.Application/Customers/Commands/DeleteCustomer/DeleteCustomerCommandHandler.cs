using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Commands.DeleteCustomer;

/// <summary>
/// Cari hesap silme komut işleyicisi
/// </summary>
public class DeleteCustomerCommandHandler : IRequestHandler<DeleteCustomerCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteCustomerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(DeleteCustomerCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<bool>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Cari hesap var mı?
        var customer = await _context.Customers
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<bool>.Fail("Cari hesap bulunamadı");

        // Soft delete
        customer.IsDeleted = true;
        customer.DeletedAt = DateTime.UtcNow;
        customer.DeletedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

