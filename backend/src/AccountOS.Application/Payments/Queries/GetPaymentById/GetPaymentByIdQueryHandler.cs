using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Payments.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Payments.Queries.GetPaymentById;

public class GetPaymentByIdQueryHandler : IRequestHandler<GetPaymentByIdQuery, Result<PaymentDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetPaymentByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<PaymentDto>> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<PaymentDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var payment = await _context.Payments
            .Include(p => p.Customer)
            .Include(p => p.Invoice)
            .Where(p => p.Id == request.Id && p.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (payment == null)
            return Result<PaymentDto>.Fail("Ödeme bulunamadı");

        var dto = new PaymentDto
        {
            Id = payment.Id,
            CompanyId = payment.CompanyId,
            PaymentNumber = payment.PaymentNumber,
            Type = payment.Type,
            TypeName = payment.Type == PaymentType.Receipt ? "Tahsilat" : "Ödeme",
            CustomerId = payment.CustomerId,
            CustomerName = payment.Customer.Name,
            CustomerCode = payment.Customer.Code,
            InvoiceId = payment.InvoiceId,
            InvoiceNumber = payment.Invoice?.InvoiceNumber,
            PaymentDate = payment.PaymentDate,
            Method = payment.Method,
            MethodName = GetMethodName(payment.Method),
            Amount = payment.Amount,
            Currency = payment.Currency,
            ExchangeRate = payment.ExchangeRate,
            BaseCurrency = payment.BaseCurrency,
            AmountInBase = payment.AmountInBase,
            BankAccount = payment.BankAccount,
            ReferenceNumber = payment.ReferenceNumber,
            Description = payment.Description,
            CreatedAt = payment.CreatedAt
        };

        return Result<PaymentDto>.Ok(dto);
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

