using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Accounting.Commands.DeleteTaxRate;

public class DeleteTaxRateCommandHandler 
    : IRequestHandler<DeleteTaxRateCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public DeleteTaxRateCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(
        DeleteTaxRateCommand request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<bool>.Fail("Kullanıcı bilgisi bulunamadı");

        var taxRate = await _context.TaxRates
            .Where(t => t.Id == request.TaxRateId && t.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (taxRate == null)
            return Result<bool>.Fail("Vergi oranı bulunamadı");

        // Check if tax rate is in use
        var isInUse = await _context.TaxCalculations
            .Where(t => t.TaxRateId == request.TaxRateId)
            .AnyAsync(cancellationToken);

        if (isInUse)
            return Result<bool>.Fail("Bu vergi oranı kullanımda olduğu için silinemez. Bunun yerine pasif yapabilirsiniz.");

        // Soft delete
        taxRate.IsDeleted = true;
        taxRate.DeletedAt = DateTime.UtcNow;
        taxRate.DeletedBy = _currentUser.UserId.Value;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}

