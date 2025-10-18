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
    private readonly ITenantService _tenantService;

    public GetCustomersQueryHandler(
        IApplicationDbContext context,
        ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Result<List<CustomerDto>>> Handle(GetCustomersQuery request, CancellationToken cancellationToken)
    {
        // Şirket kontrolü (multi-tenant) - X-Company-Id header'ından al
        Guid companyId;
        try
        {
            companyId = _tenantService.GetCurrentCompanyId();
        }
        catch (UnauthorizedAccessException)
        {
            return Result<List<CustomerDto>>.Fail("Şirket bilgisi bulunamadı");
        }

        var query = _context.Customers
            .Where(c => c.CompanyId == companyId);

        // Aktif filtresi
        if (request.ActiveOnly)
            query = query.Where(c => c.IsActive);

        // Arama
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm;
            query = query.Where(c => 
                c.Name.Contains(searchTerm) ||
                c.Code.Contains(searchTerm) ||
                (c.Email != null && c.Email.Contains(searchTerm)) ||
                (c.TaxNumber != null && c.TaxNumber.Contains(searchTerm)));
        }

        var customers = await query
            .OrderBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var customerDtos = customers.Select(c => new CustomerDto
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
        }).ToList();

        return Result<List<CustomerDto>>.Ok(customerDtos);
    }
}

