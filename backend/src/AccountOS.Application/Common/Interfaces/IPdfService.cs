using AccountOS.Application.Customers.Common;
using AccountOS.Application.Invoices.Common;

namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// PDF oluşturma servisi
/// </summary>
public interface IPdfService
{
    /// <summary>
    /// Fatura PDF'i oluştur
    /// </summary>
    byte[] GenerateInvoicePdf(InvoiceDto invoice);

    /// <summary>
    /// Cari hesap ekstresi PDF'i oluştur
    /// </summary>
    byte[] GenerateCustomerStatementPdf(CustomerStatementDto statement);
}
