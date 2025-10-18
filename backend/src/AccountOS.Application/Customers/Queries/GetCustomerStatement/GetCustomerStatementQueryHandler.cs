using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Customers.Queries.GetCustomerStatement;

/// <summary>
/// Cari hesap ekstresi sorgu işleyicisi
/// </summary>
public class GetCustomerStatementQueryHandler : IRequestHandler<GetCustomerStatementQuery, Result<CustomerStatementDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetCustomerStatementQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CustomerStatementDto>> Handle(GetCustomerStatementQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<CustomerStatementDto>.Fail("Şirket bilgisi bulunamadı");

        var companyId = _currentUser.CompanyId.Value;

        // Şirket bilgilerini getir
        var company = await _context.Companies
            .Where(c => c.Id == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (company == null)
            return Result<CustomerStatementDto>.Fail("Şirket bulunamadı");

        // Cari hesap bilgilerini getir
        var customer = await _context.Customers
            .Where(c => c.Id == request.CustomerId && c.CompanyId == companyId)
            .FirstOrDefaultAsync(cancellationToken);

        if (customer == null)
            return Result<CustomerStatementDto>.Fail("Cari hesap bulunamadı");

        // Faturaları getir
        var invoices = await _context.Invoices
            .Include(i => i.Items)
            .Where(i => i.CompanyId == companyId
                     && i.CustomerId == request.CustomerId
                     && i.InvoiceDate >= request.StartDate
                     && i.InvoiceDate <= request.EndDate
                     && i.Status != InvoiceStatus.Draft
                     && i.Status != InvoiceStatus.Cancelled)
            .OrderBy(i => i.InvoiceDate)
            .ToListAsync(cancellationToken);

        // Ödemeleri getir
        var payments = await _context.Payments
            .Where(p => p.CompanyId == companyId
                     && p.CustomerId == request.CustomerId
                     && p.PaymentDate >= request.StartDate
                     && p.PaymentDate <= request.EndDate)
            .OrderBy(p => p.PaymentDate)
            .ToListAsync(cancellationToken);

        // Her para birimi için işlemleri hazırla
        var transactionsByCurrency = new Dictionary<string, List<CustomerTransactionDto>>();

        foreach (var currency in request.Currencies)
        {
            var transactions = new List<CustomerTransactionDto>();
            decimal runningBalance = 0;

            // Faturaları ekle
            foreach (var invoice in invoices.Where(i => i.Currency == currency))
            {
                var debit = invoice.Type == InvoiceType.Sales ? invoice.GrandTotal : 0;
                var credit = invoice.Type == InvoiceType.Purchase ? invoice.GrandTotal : 0;
                
                runningBalance += debit - credit;

                var description = $"{(invoice.Type == InvoiceType.Sales ? "Satış" : "Alış")} Faturası — {invoice.InvoiceNumber}";
                if (request.ShowItems && invoice.Items.Any())
                {
                    description += "\n" + string.Join("\n", 
                        invoice.Items.Select(item => 
                            $"{item.ProductName} {item.Quantity} {item.Unit} × {item.UnitPrice:N2} {currency}"));
                }

                transactions.Add(new CustomerTransactionDto
                {
                    TransactionDate = invoice.InvoiceDate,
                    Description = description,
                    DueDate = invoice.DueDate,
                    Debit = debit,
                    Credit = credit,
                    Balance = runningBalance,
                    Currency = currency
                });
            }

            // Ödemeleri ekle
            foreach (var payment in payments.Where(p => p.Currency == currency))
            {
                var credit = payment.Type == PaymentType.Receipt ? payment.Amount : 0;
                var debit = payment.Type == PaymentType.Payment ? payment.Amount : 0;
                
                runningBalance += debit - credit;

                var methodName = GetMethodName(payment.Method);
                var description = $"{(payment.Type == PaymentType.Receipt ? "Tahsilat" : "Ödeme")} — {methodName}";
                
                if (!string.IsNullOrWhiteSpace(payment.ReferenceNumber))
                    description += $" #{payment.ReferenceNumber}";

                transactions.Add(new CustomerTransactionDto
                {
                    TransactionDate = payment.PaymentDate,
                    Description = description,
                    DueDate = null,
                    Debit = debit,
                    Credit = credit,
                    Balance = runningBalance,
                    Currency = currency
                });
            }

            transactionsByCurrency[currency] = transactions.OrderBy(t => t.TransactionDate).ToList();
        }

        // Toplamları hesapla
        var tryTransactions = transactionsByCurrency.GetValueOrDefault("TRY", new());
        var usdTransactions = transactionsByCurrency.GetValueOrDefault("USD", new());
        var eurTransactions = transactionsByCurrency.GetValueOrDefault("EUR", new());

        // Banka hesap bilgileri (hardcoded - gerçek uygulamada Company'den gelecek)
        var bankAccounts = new List<BankAccountInfoDto>();
        if (request.ShowBankAccounts)
        {
            bankAccounts = new List<BankAccountInfoDto>
            {
                new() { BankName = "Kuveyt Türk", BranchName = "TÜMSAN SANAYİ ŞUBESİ", Currency = "TRY", 
                        AccountNumber = "97191958-1", IBAN = "TR110020500009719195800001" },
                new() { BankName = "Kuveyt Türk", BranchName = "TÜMSAN SANAYİ ŞUBESİ", Currency = "USD", 
                        AccountNumber = "97191958-101", IBAN = "TR270020500009719195800101" },
                new() { BankName = "Kuveyt Türk", BranchName = "TÜMSAN SANAYİ ŞUBESİ", Currency = "EUR", 
                        AccountNumber = "97191958-102", IBAN = "TR970020500009719195800102" },
                new() { BankName = "Vakıf Katılım", BranchName = "BAŞAKŞEHİR", Currency = "TRY", 
                        AccountNumber = "887512-1", IBAN = "TR900021000000088751200001" }
            };
        }

        var statement = new CustomerStatementDto
        {
            Company = new CompanyInfoDto
            {
                Name = company.Name,
                Address = company.Address ?? "",
                TaxOffice = company.TaxOffice ?? "",
                TaxNumber = company.TaxNumber ?? "",
                Phone = company.Phone,
                Email = company.Email
            },
            Customer = new CustomerInfoDto
            {
                Code = customer.Code,
                Name = customer.Name,
                Address = customer.BillingAddress ?? "",
                TaxOffice = customer.TaxOffice ?? "",
                TaxNumber = customer.TaxNumber ?? ""
            },
            DateRange = new DateRangeDto
            {
                StartDate = request.StartDate,
                EndDate = request.EndDate
            },
            Transactions = tryTransactions,
            TotalDebitTRY = tryTransactions.Sum(t => t.Debit),
            TotalCreditTRY = tryTransactions.Sum(t => t.Credit),
            BalanceTRY = tryTransactions.LastOrDefault()?.Balance ?? 0,
            TotalDebitUSD = usdTransactions.Any() ? usdTransactions.Sum(t => t.Debit) : null,
            TotalCreditUSD = usdTransactions.Any() ? usdTransactions.Sum(t => t.Credit) : null,
            BalanceUSD = usdTransactions.Any() ? usdTransactions.LastOrDefault()?.Balance : null,
            TotalDebitEUR = eurTransactions.Any() ? eurTransactions.Sum(t => t.Debit) : null,
            TotalCreditEUR = eurTransactions.Any() ? eurTransactions.Sum(t => t.Credit) : null,
            BalanceEUR = eurTransactions.Any() ? eurTransactions.LastOrDefault()?.Balance : null,
            BankAccounts = bankAccounts,
            GeneratedAt = DateTime.UtcNow
        };

        return Result<CustomerStatementDto>.Ok(statement);
    }

    private static string GetMethodName(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.Cash => "Nakit",
            PaymentMethod.BankTransfer => "Havale",
            PaymentMethod.CreditCard => "Kredi Kartı",
            PaymentMethod.Check => "Çek",
            PaymentMethod.PromissoryNote => "Senet",
            _ => method.ToString()
        };
    }
}

