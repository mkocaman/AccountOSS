using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Invoices.Queries.GetInvoiceById;

public class GetInvoiceByIdQueryHandler : IRequestHandler<GetInvoiceByIdQuery, Result<InvoiceDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetInvoiceByIdQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<InvoiceDto>> Handle(GetInvoiceByIdQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<InvoiceDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        var invoice = await _context.Invoices
            .Include(i => i.Customer)
            .Include(i => i.Items)
            .Where(i => i.Id == request.Id && i.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (invoice == null)
            return Result<InvoiceDto>.Fail("Fatura bulunamadı");

        var dto = new InvoiceDto
        {
            Id = invoice.Id,
            CompanyId = invoice.CompanyId,
            InvoiceNumber = invoice.InvoiceNumber,
            Type = invoice.Type,
            TypeName = invoice.Type == InvoiceType.Sales ? "Satış" : "Alış",
            CustomerId = invoice.CustomerId,
            CustomerName = invoice.Customer.Name,
            CustomerCode = invoice.Customer.Code,
            InvoiceDate = invoice.InvoiceDate,
            DueDate = invoice.DueDate,
            Currency = invoice.Currency,
            ExchangeRate = invoice.ExchangeRate,
            BaseCurrency = invoice.BaseCurrency,
            SubTotal = invoice.SubTotal,
            VatTotal = invoice.VatTotal,
            GrandTotal = invoice.GrandTotal,
            GrandTotalInBase = invoice.GrandTotalInBase,
            PaidAmount = invoice.PaidAmount,
            RemainingAmount = invoice.RemainingAmount,
            Status = invoice.Status,
            StatusName = GetStatusName(invoice.Status),
            Notes = invoice.Notes,
            Items = invoice.Items.OrderBy(i => i.LineNumber).Select(i => new InvoiceItemDto
            {
                Id = i.Id,
                LineNumber = i.LineNumber,
                ProductId = i.ProductId,
                ProductName = i.ProductName,
                ProductCode = i.ProductCode,
                Description = i.Description,
                Quantity = i.Quantity,
                Unit = i.Unit,
                UnitPrice = i.UnitPrice,
                DiscountPercentage = i.DiscountPercentage,
                DiscountAmount = i.DiscountAmount,
                VatRate = i.VatRate,
                SubTotal = i.SubTotal,
                VatAmount = i.VatAmount,
                Total = i.Total,
                FifoCost = i.FifoCost
            }).ToList(),
            CreatedAt = invoice.CreatedAt
        };

        return Result<InvoiceDto>.Ok(dto);
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
