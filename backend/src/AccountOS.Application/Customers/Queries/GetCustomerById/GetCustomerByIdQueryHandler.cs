using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Queries.GetCustomerById;

/// <summary>
/// Cari hesap detay sorgu işleyicisi
/// </summary>
public class GetCustomerByIdQueryHandler : IRequestHandler<GetCustomerByIdQuery, Result<CustomerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCustomerByIdQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomerDto>> Handle(GetCustomerByIdQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü (multi-tenant)
        if (_currentUser.CompanyId == null)
            return Result<CustomerDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var customer = await _context.Customers
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<CustomerDto>.Fail("Cari hesap bulunamadı");

        var dto = new CustomerDto
        {
            Id = customer.Id,
            CompanyId = customer.CompanyId,
            Code = customer.Code,
            Name = customer.Name,
            Type = customer.Type,
            TypeName = customer.Type == CustomerType.Individual ? "Bireysel" : "Kurumsal",
            Email = customer.Email,
            Phone = customer.Phone,
            MobilePhone = customer.MobilePhone,
            Website = customer.Website,
            TaxNumber = customer.TaxNumber,
            TaxOffice = customer.TaxOffice,
            IdentityNumber = customer.IdentityNumber,
            BillingAddress = customer.BillingAddress,
            ShippingAddress = customer.ShippingAddress,
            City = customer.City,
            Country = customer.Country,
            PostalCode = customer.PostalCode,
            Currency = customer.Currency,
            CreditLimit = customer.CreditLimit,
            PaymentTermDays = customer.PaymentTermDays,
            CurrentBalance = customer.CurrentBalance,
            BalanceStatus = customer.CurrentBalance >= 0 ? "Alacak" : "Borç",
            IsActive = customer.IsActive,
            IsBlocked = customer.IsBlocked,
            BlockReason = customer.BlockReason,
            Notes = customer.Notes,
            CreatedAt = customer.CreatedAt
        };

        return Result<CustomerDto>.Ok(dto);
    }
}

