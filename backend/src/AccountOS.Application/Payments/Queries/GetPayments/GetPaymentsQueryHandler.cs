using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Payments.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Payments.Queries.GetPayments;

/// <summary>
/// Ödeme listesi sorgu işleyicisi
/// </summary>
public class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, Result<List<PaymentDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetPaymentsQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<PaymentDto>>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<PaymentDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.Payments
            .Include(p => p.Customer)
            .Include(p => p.Invoice)
            .Where(p => p.CompanyId == companyId);

        // Filtreler
        if (request.Type.HasValue)
            query = query.Where(p => p.Type == request.Type.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(p => p.CustomerId == request.CustomerId.Value);

        if (request.InvoiceId.HasValue)
            query = query.Where(p => p.InvoiceId == request.InvoiceId.Value);

        if (request.Method.HasValue)
            query = query.Where(p => p.Method == request.Method.Value);

        if (request.StartDate.HasValue)
            query = query.Where(p => p.PaymentDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(p => p.PaymentDate <= request.EndDate.Value);

        // Arama
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p =>
                p.PaymentNumber.ToLower().Contains(searchTerm) ||
                p.Customer.Name.ToLower().Contains(searchTerm) ||
                p.Customer.Code.ToLower().Contains(searchTerm) ||
                (p.ReferenceNumber != null && p.ReferenceNumber.ToLower().Contains(searchTerm)));
        }

        var payments = await query
            .OrderByDescending(p => p.PaymentDate)
            .ThenByDescending(p => p.CreatedAt)
            .Select(p => new PaymentDto
            {
                Id = p.Id,
                CompanyId = p.CompanyId,
                PaymentNumber = p.PaymentNumber,
                Type = p.Type,
                TypeName = p.Type == PaymentType.Receipt ? "Tahsilat" : "Ödeme",
                CustomerId = p.CustomerId,
                CustomerName = p.Customer.Name,
                CustomerCode = p.Customer.Code,
                InvoiceId = p.InvoiceId,
                InvoiceNumber = p.Invoice != null ? p.Invoice.InvoiceNumber : null,
                PaymentDate = p.PaymentDate,
                Method = p.Method,
                MethodName = GetMethodName(p.Method),
                Amount = p.Amount,
                Currency = p.Currency,
                ExchangeRate = p.ExchangeRate,
                BaseCurrency = p.BaseCurrency,
                AmountInBase = p.AmountInBase,
                BankAccount = p.BankAccount,
                ReferenceNumber = p.ReferenceNumber,
                Description = p.Description,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<PaymentDto>>.Ok(payments);
    }

    private static string GetMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.Cash => "Nakit",
            PaymentMethod.BankTransfer => "Banka Havalesi",
            PaymentMethod.CreditCard => "Kredi Kartı",
            PaymentMethod.Check => "Çek",
            PaymentMethod.PromissoryNote => "Senet",
            _ => method.ToString()
        };
    }
}

