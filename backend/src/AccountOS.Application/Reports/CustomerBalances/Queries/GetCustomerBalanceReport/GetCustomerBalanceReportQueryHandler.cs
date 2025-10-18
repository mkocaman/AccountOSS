using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Reports.CustomerBalances;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Reports.CustomerBalances.Queries.GetCustomerBalanceReport;

public class GetCustomerBalanceReportQueryHandler 
    : IRequestHandler<GetCustomerBalanceReportQuery, Result<CustomerBalanceReportDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCustomerBalanceReportQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomerBalanceReportDto>> Handle(
        GetCustomerBalanceReportQuery request, 
        CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<CustomerBalanceReportDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Tüm müşterileri getir
        var customers = await _context.Customers
            .Where(c => c.CompanyId == companyId)
            .ToListAsync(cancellationToken);

        var balances = new List<CustomerBalanceDto>();

        foreach (var customer in customers)
        {
            // Faturaları getir
            var invoices = await _context.Invoices
                .Where(i => i.CompanyId == companyId
                         && i.CustomerId == customer.Id
                         && i.Status != InvoiceStatus.Draft
                         && i.Status != InvoiceStatus.Cancelled
                         && i.Currency == request.Currency)
                .ToListAsync(cancellationToken);

            // Ödemeleri getir
            var payments = await _context.Payments
                .Where(p => p.CompanyId == companyId
                         && p.CustomerId == customer.Id
                         && p.Currency == request.Currency)
                .ToListAsync(cancellationToken);

            // Borç/Alacak hesapla
            var debit = invoices
                .Where(i => i.Type == InvoiceType.Sales)
                .Sum(i => i.GrandTotal);

            var credit = invoices
                .Where(i => i.Type == InvoiceType.Purchase)
                .Sum(i => i.GrandTotal);

            credit += payments
                .Where(p => p.Type == PaymentType.Receipt)
                .Sum(p => p.Amount);

            debit += payments
                .Where(p => p.Type == PaymentType.Payment)
                .Sum(p => p.Amount);

            balances.Add(new CustomerBalanceDto
            {
                CustomerId = customer.Id,
                CustomerCode = customer.Code,
                CustomerName = customer.Name,
                Debit = debit,
                Credit = credit,
                Currency = request.Currency
            });
        }

        // Yaşlandırılmış alacaklar
        var agedReceivables = new List<AgedReceivableDto>();

        if (request.IncludeAging)
        {
            var today = DateTime.UtcNow.Date;

            foreach (var customer in customers)
            {
                var unpaidInvoices = await _context.Invoices
                    .Where(i => i.CompanyId == companyId
                             && i.CustomerId == customer.Id
                             && i.Type == InvoiceType.Sales
                             && (i.Status == InvoiceStatus.Issued || i.Status == InvoiceStatus.PartiallyPaid)
                             && i.RemainingAmount > 0
                             && i.Currency == request.Currency)
                    .ToListAsync(cancellationToken);

                if (!unpaidInvoices.Any())
                    continue;

                var current = 0m;      // 0-30 days
                var days30 = 0m;       // 31-60 days
                var days60 = 0m;       // 61-90 days
                var days90Plus = 0m;   // 90+ days

                foreach (var invoice in unpaidInvoices)
                {
                    var dueDate = invoice.DueDate ?? invoice.InvoiceDate;
                    var daysOverdue = (today - dueDate).Days;
                    var remaining = invoice.RemainingAmount;

                    if (daysOverdue <= 30)
                        current += remaining;
                    else if (daysOverdue <= 60)
                        days30 += remaining;
                    else if (daysOverdue <= 90)
                        days60 += remaining;
                    else
                        days90Plus += remaining;
                }

                var totalReceivable = current + days30 + days60 + days90Plus;

                if (totalReceivable > 0)
                {
                    agedReceivables.Add(new AgedReceivableDto
                    {
                        CustomerId = customer.Id,
                        CustomerCode = customer.Code,
                        CustomerName = customer.Name,
                        Current = current,
                        Days30 = days30,
                        Days60 = days60,
                        Days90Plus = days90Plus,
                        TotalReceivable = totalReceivable,
                        Currency = request.Currency
                    });
                }
            }
        }

        // Özet
        var summary = new CustomerBalanceSummary
        {
            TotalCustomers = customers.Count,
            CustomersWithReceivables = balances.Count(b => b.Balance > 0),
            CustomersWithPayables = balances.Count(b => b.Balance < 0),
            TotalReceivables = balances.Where(b => b.Balance > 0).Sum(b => b.Balance),
            TotalPayables = Math.Abs(balances.Where(b => b.Balance < 0).Sum(b => b.Balance)),
            Currency = request.Currency
        };

        var report = new CustomerBalanceReportDto
        {
            GeneratedAt = DateTime.UtcNow,
            Summary = summary,
            Balances = balances.OrderByDescending(b => Math.Abs(b.Balance)).ToList(),
            AgedReceivables = agedReceivables.OrderByDescending(a => a.TotalReceivable).ToList()
        };

        return Result<CustomerBalanceReportDto>.Ok(report);
    }
}

