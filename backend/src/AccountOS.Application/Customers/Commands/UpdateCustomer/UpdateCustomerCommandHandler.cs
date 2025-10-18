using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Commands.UpdateCustomer;

/// <summary>
/// Cari hesap güncelleme komut işleyicisi
/// </summary>
public class UpdateCustomerCommandHandler : IRequestHandler<UpdateCustomerCommand, Result<CustomerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public UpdateCustomerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomerDto>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<CustomerDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Cari hesap var mı?
        var customer = await _context.Customers
            .Where(c => c.Id == request.Id && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<CustomerDto>.Fail("Cari hesap bulunamadı");

        // Aynı isimde başka cari hesap var mı?
        if (request.Name != customer.Name)
        {
            var existingCustomer = await _context.Customers
                .Where(c => c.CompanyId == companyId 
                         && c.Name.ToLower() == request.Name.ToLower() 
                         && c.Id != request.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (existingCustomer != null)
                return Result<CustomerDto>.Fail($"'{request.Name}' adında bir cari hesap zaten mevcut");
        }

        // Güncelle
        customer.Name = request.Name;
        customer.Type = request.Type;
        customer.Email = request.Email;
        customer.Phone = request.Phone;
        customer.MobilePhone = request.MobilePhone;
        customer.Website = request.Website;
        customer.TaxNumber = request.TaxNumber;
        customer.TaxOffice = request.TaxOffice;
        customer.IdentityNumber = request.IdentityNumber;
        customer.BillingAddress = request.BillingAddress;
        customer.ShippingAddress = request.ShippingAddress;
        customer.City = request.City;
        customer.Country = request.Country;
        customer.PostalCode = request.PostalCode;
        
        if (!string.IsNullOrWhiteSpace(request.Currency))
            customer.Currency = request.Currency;
        
        customer.CreditLimit = request.CreditLimit;
        customer.PaymentTermDays = request.PaymentTermDays;
        customer.Notes = request.Notes;
        customer.UpdatedAt = DateTime.UtcNow;
        customer.UpdatedBy = userId;

        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
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

