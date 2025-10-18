using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Invoices.Queries.GetInvoices;

public class GetInvoicesQueryHandler : IRequestHandler<GetInvoicesQuery, Result<List<InvoiceDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetInvoicesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<InvoiceDto>>> Handle(GetInvoicesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<InvoiceDto>>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var query = _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.CompanyId == companyId);

        if (request.Type.HasValue)
            query = query.Where(i => i.Type == request.Type.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(i => i.CustomerId == request.CustomerId.Value);

        if (request.Status.HasValue)
            query = query.Where(i => i.Status == request.Status.Value);

        if (request.StartDate.HasValue)
            query = query.Where(i => i.InvoiceDate >= request.StartDate.Value);

        if (request.EndDate.HasValue)
            query = query.Where(i => i.InvoiceDate <= request.EndDate.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(i =>
                i.InvoiceNumber.ToLower().Contains(searchTerm) ||
                i.Customer.Name.ToLower().Contains(searchTerm) ||
                i.Customer.Code.ToLower().Contains(searchTerm));
        }

        var invoices = await query
            .OrderByDescending(i => i.InvoiceDate)
            .ThenByDescending(i => i.CreatedAt)
            .Select(i => new InvoiceDto
            {
                Id = i.Id,
                CompanyId = i.CompanyId,
                InvoiceNumber = i.InvoiceNumber,
                Type = i.Type,
                TypeName = i.Type == InvoiceType.Sales ? "Satış" : "Alış",
                CustomerId = i.CustomerId,
                CustomerName = i.Customer.Name,
                CustomerCode = i.Customer.Code,
                InvoiceDate = i.InvoiceDate,
                DueDate = i.DueDate,
                Currency = i.Currency,
                ExchangeRate = i.ExchangeRate,
                BaseCurrency = i.BaseCurrency,
                SubTotal = i.SubTotal,
                VatTotal = i.VatTotal,
                GrandTotal = i.GrandTotal,
                GrandTotalInBase = i.GrandTotalInBase,
                PaidAmount = i.PaidAmount,
                RemainingAmount = i.RemainingAmount,
                Status = i.Status,
                StatusName = GetStatusName(i.Status),
                Notes = i.Notes,
                Items = i.Items.OrderBy(ii => ii.LineNumber).Select(ii => new InvoiceItemDto
                {
                    Id = ii.Id,
                    LineNumber = ii.LineNumber,
                    ProductId = ii.ProductId,
                    ProductName = ii.ProductName,
                    ProductCode = ii.ProductCode,
                    Description = ii.Description,
                    Quantity = ii.Quantity,
                    Unit = ii.Unit,
                    UnitPrice = ii.UnitPrice,
                    DiscountPercentage = ii.DiscountPercentage,
                    DiscountAmount = ii.DiscountAmount,
                    VatRate = ii.VatRate,
                    SubTotal = ii.SubTotal,
                    VatAmount = ii.VatAmount,
                    Total = ii.Total,
                    FifoCost = ii.FifoCost
                }).ToList(),
                CreatedAt = i.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<InvoiceDto>>.Ok(invoices);
    }

    private static string GetStatusName(InvoiceStatus status)
    {
        return status switch
        {
            InvoiceStatus.Draft => "Taslak",
            InvoiceStatus.Issued => "Kesildi",
            InvoiceStatus.PartiallyPaid => "Kısmi Ödendi",
            InvoiceStatus.Paid => "Ödendi",
            InvoiceStatus.Overdue => "Vadesi Geçti",
            InvoiceStatus.Cancelled => "İptal",
            _ => status.ToString()
        };
    }
}
