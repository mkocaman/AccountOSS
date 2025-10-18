using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Commands.CreateCustomer;

/// <summary>
/// Cari hesap oluşturma komut işleyicisi
/// </summary>
public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, Result<CustomerDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateCustomerCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomerDto>> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı ve şirket kontrolü
        if (_currentUser.UserId == null || _currentUser.CompanyId == null)
            return Result<CustomerDto>.Fail("Kullanıcı oturumu veya şirket bilgisi bulunamadı");

        var userId = _currentUser.UserId.Value;
        var companyId = _currentUser.CompanyId.Value;

        // Aynı isimde cari hesap var mı?
        var existingCustomer = await _context.Customers
            .Where(c => c.CompanyId == companyId && c.Name.ToLower() == request.Name.ToLower())
            .FirstOrDefaultAsync(cancellationToken);

        if (existingCustomer != null)
            return Result<CustomerDto>.Fail($"'{request.Name}' adında bir cari hesap zaten mevcut");

        // Otomatik kod oluştur (C-0001, C-0002, vb.)
        var lastCustomer = await _context.Customers
            .Where(c => c.CompanyId == companyId)
            .OrderByDescending(c => c.Code)
            .FirstOrDefaultAsync(cancellationToken);

        var nextNumber = 1;
        if (lastCustomer != null && lastCustomer.Code.StartsWith("C-"))
        {
            var lastNumber = lastCustomer.Code.Substring(2);
            if (int.TryParse(lastNumber, out var parsed))
                nextNumber = parsed + 1;
        }

        var code = $"C-{nextNumber:D4}"; // C-0001, C-0002, ...

        // Yeni cari hesap oluştur
        var customer = new Customer
        {
            Id = Guid.NewGuid(),
            CompanyId = companyId,
            Code = code,
            Name = request.Name,
            Type = request.Type,
            Email = request.Email,
            Phone = request.Phone,
            MobilePhone = request.MobilePhone,
            Website = request.Website,
            TaxNumber = request.TaxNumber,
            TaxOffice = request.TaxOffice,
            IdentityNumber = request.IdentityNumber,
            BillingAddress = request.BillingAddress,
            ShippingAddress = request.ShippingAddress,
            City = request.City,
            Country = request.Country,
            PostalCode = request.PostalCode,
            Currency = request.Currency,
            CreditLimit = request.CreditLimit,
            PaymentTermDays = request.PaymentTermDays,
            CurrentBalance = 0,
            IsActive = true,
            IsBlocked = false,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Customers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);

        // DTO'ya dönüştür
        var dto = MapToDto(customer);

        return Result<CustomerDto>.Ok(dto);
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
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
    }
}

