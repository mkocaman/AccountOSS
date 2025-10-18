using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Invoices.Commands.CancelInvoice;

/// <summary>
/// Fatura iptal komut işleyicisi
/// </summary>
public class CancelInvoiceCommandHandler : IRequestHandler<CancelInvoiceCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CancelInvoiceCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<bool>> Handle(CancelInvoiceCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<bool>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Faturayı getir
        var invoice = await _context.Invoices
            .Where(i => i.Id == request.InvoiceId && i.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null)
            return Result<bool>.Fail("Fatura bulunamadı");

        // Ödeme yapılmışsa iptal edilemez
        if (invoice.PaidAmount > 0)
            return Result<bool>.Fail("Ödemesi yapılmış fatura iptal edilemez");

        // Kesilmiş fatura ise uyarı ver (stok iade edilmeli)
        if (invoice.Status == InvoiceStatus.Issued)
        {
            // TODO: Stok iade işlemi (gelecek versiyonda)
            // Şimdilik sadece uyarı
        }

        // Faturayı iptal et
        invoice.Status = InvoiceStatus.Cancelled;
        invoice.UpdatedAt = DateTime.UtcNow;
        invoice.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Ok(true);
    }
}
