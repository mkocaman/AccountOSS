using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Queries.GetCustomers;

/// <summary>
/// Cari hesap listesi sorgu işleyicisi
/// </summary>
public class GetCustomersQueryHandler : IRequestHandler<GetCustomersQuery, Result<List<CustomerDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCustomersQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<CustomerDto>>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü (multi-tenant)
        if (_currentUser.CompanyId == null)
            return Result<List<CustomerDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.Customers
            .Where(c => c.CompanyId == companyId);

        // Aktif filtresi
        if (request.ActiveOnly)
            query = query.Where(c => c.IsActive);

        // Arama
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c => 
                c.Name.ToLower().Contains(searchTerm) ||
                c.Code.ToLower().Contains(searchTerm) ||
                (c.Email != null && c.Email.ToLower().Contains(searchTerm)) ||
                (c.TaxNumber != null && c.TaxNumber.Contains(searchTerm)));
        }

        var customers = await query
            .OrderBy(c => c.Name)
            .Select(c => new CustomerDto
            {
                Id = c.Id,
                CompanyId = c.CompanyId,
                Code = c.Code,
                Name = c.Name,
                Type = c.Type,
                TypeName = c.Type == CustomerType.Individual ? "Bireysel" : "Kurumsal",
                Email = c.Email,
                Phone = c.Phone,
                MobilePhone = c.MobilePhone,
                Website = c.Website,
                TaxNumber = c.TaxNumber,
                TaxOffice = c.TaxOffice,
                IdentityNumber = c.IdentityNumber,
                BillingAddress = c.BillingAddress,
                ShippingAddress = c.ShippingAddress,
                City = c.City,
                Country = c.Country,
                PostalCode = c.PostalCode,
                Currency = c.Currency,
                CreditLimit = c.CreditLimit,
                PaymentTermDays = c.PaymentTermDays,
                CurrentBalance = c.CurrentBalance,
                BalanceStatus = c.CurrentBalance >= 0 ? "Alacak" : "Borç",
                IsActive = c.IsActive,
                IsBlocked = c.IsBlocked,
                BlockReason = c.BlockReason,
                Notes = c.Notes,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerDto>>.Ok(customers);
    }
}

