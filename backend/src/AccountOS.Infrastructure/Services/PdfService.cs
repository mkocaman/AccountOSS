using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Customers.Common;
using AccountOS.Application.Invoices.Common;
using AccountOS.Domain.Enums;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// PDF oluşturma servisi implementasyonu
/// </summary>
public class PdfService : IPdfService
{
    public PdfService()
    {
        // QuestPDF lisans ayarı (Community license)
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateInvoicePdf(InvoiceDto invoice)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeInvoiceHeader(c, invoice));
                page.Content().Element(c => ComposeInvoiceContent(c, invoice));
                page.Footer().Element(c => ComposeInvoiceFooter(c, invoice));
            });
        }).GeneratePdf();
    }

    public byte[] GenerateCustomerStatementPdf(CustomerStatementDto statement)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10));

                page.Header().Element(c => ComposeStatementHeader(c, statement));
                page.Content().Element(c => ComposeStatementContent(c, statement));
                page.Footer().Element(c => ComposeStatementFooter(c, statement));
            });
        }).GeneratePdf();
    }

    // ==================== INVOICE PDF ====================

    private void ComposeInvoiceHeader(IContainer container, InvoiceDto invoice)
    {
        container.Column(column =>
        {
            // Logo ve şirket bilgileri
            column.Item().Row(row =>
            {
                // Sol taraf - Şirket bilgileri
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("BEYCE İÇ VE DIŞ TİCARET LTD. ŞTİ.")
                        .FontSize(14).Bold();
                    col.Item().Text("Kayabaşı Mah. 75. Yıl Cad. 10. Bölge")
                        .FontSize(9);
                    col.Item().Text("Opal Sit. C-52 Blok No:12L No:56")
                        .FontSize(9);
                    col.Item().Text("İSTANBUL / Başakşehir")
                        .FontSize(9);
                    col.Item().PaddingTop(5);
                    col.Item().Text("VD: İKİTELLİ  VKN: 1671197670")
                        .FontSize(9);
                    col.Item().Text("TEL: +90 532 200 9964")
                        .FontSize(9);
                });

                // Sağ taraf - Fatura bilgileri
                row.RelativeItem().Column(col =>
                {
                    col.Item().AlignRight().Text(invoice.TypeName.ToUpper() + " FATURASI")
                        .FontSize(16).Bold();
                    col.Item().AlignRight().PaddingTop(10);
                    col.Item().AlignRight().Text($"Fatura No: {invoice.InvoiceNumber}")
                        .FontSize(10).Bold();
                    col.Item().AlignRight().Text($"Tarih: {invoice.InvoiceDate:dd.MM.yyyy}")
                        .FontSize(9);
                    if (invoice.DueDate.HasValue)
                    {
                        col.Item().AlignRight().Text($"Vade: {invoice.DueDate.Value:dd.MM.yyyy}")
                            .FontSize(9);
                    }
                    col.Item().AlignRight().Text($"Para Birimi: {invoice.Currency}")
                        .FontSize(9);
                });
            });

            column.Item().PaddingTop(10).LineHorizontal(1);

            // Müşteri bilgileri
            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("MÜŞTERİ BİLGİLERİ")
                        .FontSize(11).Bold();
                    col.Item().PaddingTop(5);
                    col.Item().Text(invoice.CustomerName)
                        .FontSize(10).Bold();
                    col.Item().Text($"Kod: {invoice.CustomerCode}")
                        .FontSize(9);
                });
            });

            column.Item().PaddingTop(10).LineHorizontal(1);
        });
    }

    private void ComposeInvoiceContent(IContainer container, InvoiceDto invoice)
    {
        container.PaddingTop(20).Column(column =>
        {
            // Kalemler tablosu
            column.Item().Table(table =>
            {
                // Sütun genişlikleri
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(30);    // #
                    columns.RelativeColumn(3);     // Ürün Adı
                    columns.RelativeColumn(1);     // Miktar
                    columns.RelativeColumn(1);     // Birim
                    columns.RelativeColumn(1.5f);  // Birim Fiyat
                    columns.RelativeColumn(1);     // İndirim %
                    columns.RelativeColumn(1);     // KDV %
                    columns.RelativeColumn(1.5f);  // Toplam
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("#").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("Ürün Adı").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("Miktar").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("Birim").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignRight().Text("Birim Fiyat").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignCenter().Text("İndirim %").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignCenter().Text("KDV %").Bold();
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignRight().Text("Toplam").Bold();
                });

                // Rows
                foreach (var item in invoice.Items)
                {
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Text(item.LineNumber.ToString());
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Column(col =>
                        {
                            col.Item().Text(item.ProductName).FontSize(9);
                            col.Item().Text($"Kod: {item.ProductCode}").FontSize(8).FontColor(Colors.Grey.Medium);
                            if (!string.IsNullOrWhiteSpace(item.Description))
                            {
                                col.Item().Text(item.Description).FontSize(8).Italic();
                            }
                        });
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text($"{item.Quantity:N2}");
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Text(item.Unit);
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text($"{item.UnitPrice:N2}");
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignCenter().Text(item.DiscountPercentage > 0 
                            ? $"%{item.DiscountPercentage:N0}" 
                            : "-");
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignCenter().Text($"%{item.VatRate:N0}");
                    
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text($"{item.Total:N2}").Bold();
                }
            });

            // Toplamlar
            column.Item().PaddingTop(20).AlignRight().Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.ConstantItem(150).Text("Ara Toplam:").FontSize(10);
                    row.ConstantItem(120).AlignRight().Text($"{invoice.SubTotal:N2} {invoice.Currency}").FontSize(10);
                });

                col.Item().Row(row =>
                {
                    row.ConstantItem(150).Text("KDV Toplamı:").FontSize(10);
                    row.ConstantItem(120).AlignRight().Text($"{invoice.VatTotal:N2} {invoice.Currency}").FontSize(10);
                });

                col.Item().PaddingTop(5).LineHorizontal(1);

                col.Item().PaddingTop(5).Row(row =>
                {
                    row.ConstantItem(150).Text("GENEL TOPLAM:").FontSize(12).Bold();
                    row.ConstantItem(120).AlignRight().Text($"{invoice.GrandTotal:N2} {invoice.Currency}")
                        .FontSize(12).Bold().FontColor(Colors.Blue.Darken2);
                });

                if (invoice.Currency != invoice.BaseCurrency)
                {
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(150).Text($"({invoice.BaseCurrency} Karşılığı):").FontSize(9).Italic();
                        row.ConstantItem(120).AlignRight().Text($"{invoice.GrandTotalInBase:N2} {invoice.BaseCurrency}")
                            .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
                    });
                    col.Item().Row(row =>
                    {
                        row.ConstantItem(150).Text("Kur:").FontSize(9).Italic();
                        row.ConstantItem(120).AlignRight().Text($"{invoice.ExchangeRate:N6}")
                            .FontSize(9).Italic().FontColor(Colors.Grey.Darken1);
                    });
                }
            });

            // Notlar
            if (!string.IsNullOrWhiteSpace(invoice.Notes))
            {
                column.Item().PaddingTop(20).Column(col =>
                {
                    col.Item().Text("Notlar:").FontSize(10).Bold();
                    col.Item().PaddingTop(5).Text(invoice.Notes).FontSize(9);
                });
            }
        });
    }

    private void ComposeInvoiceFooter(IContainer container, InvoiceDto invoice)
    {
        container.AlignBottom().Column(column =>
        {
            column.Item().PaddingTop(20).LineHorizontal(1);
            
            column.Item().PaddingTop(10).Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("Banka Hesap Bilgileri").FontSize(9).Bold();
                    col.Item().PaddingTop(5);
                    col.Item().Text("Kuveyt Türk - TÜMSAN SANAYİ ŞUBESİ (TRL)").FontSize(8);
                    col.Item().Text("IBAN: TR11 0020 5000 0971 9195 8000 01").FontSize(8);
                });

                row.RelativeItem().AlignRight().Column(col =>
                {
                    col.Item().AlignRight().Text($"Oluşturulma Tarihi: {invoice.CreatedAt:dd.MM.yyyy HH:mm}")
                        .FontSize(8).FontColor(Colors.Grey.Medium);
                });
            });
        });
    }

    // ==================== CUSTOMER STATEMENT PDF ====================

    private void ComposeStatementHeader(IContainer container, CustomerStatementDto statement)
    {
        container.Column(column =>
        {
            // Şirket bilgileri
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text(statement.Company.Name)
                        .FontSize(14).Bold();
                    col.Item().Text(statement.Company.Address)
                        .FontSize(9);
                    col.Item().PaddingTop(5);
                    col.Item().Text($"VD: {statement.Company.TaxOffice}  VKN: {statement.Company.TaxNumber}")
                        .FontSize(9);
                    if (!string.IsNullOrWhiteSpace(statement.Company.Phone))
                    {
                        col.Item().Text($"TEL: {statement.Company.Phone}")
                            .FontSize(9);
                    }
                });

                row.RelativeItem().AlignRight().Column(col =>
                {
                    col.Item().AlignRight().Text("CARİ HESAP EKSTRESİ")
                        .FontSize(16).Bold();
                    col.Item().AlignRight().PaddingTop(10);
                    col.Item().AlignRight().Text($"Tarih Aralığı:")
                        .FontSize(9).Bold();
                    col.Item().AlignRight().Text($"{statement.DateRange.StartDate:dd.MM.yyyy} - {statement.DateRange.EndDate:dd.MM.yyyy}")
                        .FontSize(9);
                });
            });

            column.Item().PaddingTop(10).LineHorizontal(1);

            // Müşteri bilgileri
            column.Item().PaddingTop(10).Column(col =>
            {
                col.Item().Text("CARİ HESAP BİLGİLERİ")
                    .FontSize(11).Bold();
                col.Item().PaddingTop(5);
                col.Item().Row(row =>
                {
                    row.RelativeItem().Text(statement.Customer.Name)
                        .FontSize(10).Bold();
                    row.RelativeItem().AlignRight().Text($"Kod: {statement.Customer.Code}")
                        .FontSize(10);
                });
                col.Item().Text(statement.Customer.Address)
                    .FontSize(9);
                col.Item().Text($"VD: {statement.Customer.TaxOffice}  VKN: {statement.Customer.TaxNumber}")
                    .FontSize(9);
            });

            column.Item().PaddingTop(10).LineHorizontal(1);
        });
    }

    private void ComposeStatementContent(IContainer container, CustomerStatementDto statement)
    {
        container.PaddingTop(20).Column(column =>
        {
            // İşlem tablosu
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(1.5f);  // Tarih
                    columns.RelativeColumn(3);     // Açıklama
                    columns.RelativeColumn(1.5f);  // Vade
                    columns.RelativeColumn(1.5f);  // Borç
                    columns.RelativeColumn(1.5f);  // Alacak
                    columns.RelativeColumn(1.5f);  // Bakiye
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("İŞLEM TARİHİ").Bold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("AÇIKLAMA").Bold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).Text("VADE TARİHİ").Bold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignRight().Text("BORÇ").Bold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignRight().Text("ALACAK").Bold().FontSize(9);
                    header.Cell().Background(Colors.Grey.Lighten3)
                        .Padding(5).AlignRight().Text("BAKİYE").Bold().FontSize(9);
                });

                // Rows
                foreach (var transaction in statement.Transactions)
                {
                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Text(transaction.TransactionDate.ToString("dd.MM.yyyy"))
                        .FontSize(8);

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Text(transaction.Description)
                        .FontSize(8);

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).Text(transaction.DueDate?.ToString("dd.MM.yyyy") ?? "-")
                        .FontSize(8);

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text(transaction.Debit > 0 ? $"{transaction.Debit:N2}" : "-")
                        .FontSize(8);

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text(transaction.Credit > 0 ? $"{transaction.Credit:N2}" : "-")
                        .FontSize(8);

                    table.Cell().BorderBottom(1).BorderColor(Colors.Grey.Lighten2)
                        .Padding(5).AlignRight().Text($"{transaction.Balance:N2}")
                        .FontSize(8).Bold()
                        .FontColor(transaction.Balance >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);
                }
            });

            // Toplamlar
            column.Item().PaddingTop(20).AlignRight().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                // TRY Bakiye
                table.Cell().Padding(5).Text("TOPLAM BORÇ (TRY):").FontSize(10);
                table.Cell().Padding(5).AlignRight().Text($"{statement.TotalDebitTRY:N2} ₺").FontSize(10);

                table.Cell().Padding(5).Text("TOPLAM ALACAK (TRY):").FontSize(10);
                table.Cell().Padding(5).AlignRight().Text($"{statement.TotalCreditTRY:N2} ₺").FontSize(10);

                table.Cell().Background(Colors.Blue.Lighten4).Padding(5).Text("BAKİYE (TRY):").FontSize(11).Bold();
                table.Cell().Background(Colors.Blue.Lighten4).Padding(5).AlignRight()
                    .Text($"{statement.BalanceTRY:N2} ₺")
                    .FontSize(11).Bold()
                    .FontColor(statement.BalanceTRY >= 0 ? Colors.Green.Darken2 : Colors.Red.Darken2);

                // USD Bakiye (eğer varsa)
                if (statement.BalanceUSD.HasValue)
                {
                    table.Cell().Padding(5).PaddingTop(10).Text("BAKİYE (USD):").FontSize(10).Bold();
                    table.Cell().Padding(5).PaddingTop(10).AlignRight()
                        .Text($"{statement.BalanceUSD.Value:N2} $")
                        .FontSize(10).Bold();
                }

                // EUR Bakiye (eğer varsa)
                if (statement.BalanceEUR.HasValue)
                {
                    table.Cell().Padding(5).Text("BAKİYE (EUR):").FontSize(10).Bold();
                    table.Cell().Padding(5).AlignRight()
                        .Text($"{statement.BalanceEUR.Value:N2} €")
                        .FontSize(10).Bold();
                }
            });
        });
    }

    private void ComposeStatementFooter(IContainer container, CustomerStatementDto statement)
    {
        container.Column(column =>
        {
            if (statement.BankAccounts.Any())
            {
                column.Item().PaddingTop(20).LineHorizontal(1);
                
                column.Item().PaddingTop(10).Column(col =>
                {
                    col.Item().Text("Banka Hesap Bilgileri").FontSize(10).Bold();
                    col.Item().PaddingTop(5);

                    foreach (var account in statement.BankAccounts)
                    {
                        col.Item().PaddingTop(5).Column(accountCol =>
                        {
                            accountCol.Item().Text($"{account.BankName} - {account.BranchName} ({account.Currency})")
                                .FontSize(8).Bold();
                            accountCol.Item().Text($"HESAP NO: {account.AccountNumber}")
                                .FontSize(8);
                            accountCol.Item().Text($"IBAN: {account.IBAN}")
                                .FontSize(8);
                        });
                    }
                });
            }

            column.Item().PaddingTop(10).AlignRight()
                .Text($"{statement.GeneratedAt:dd.MM.yyyy} tarihinde hazırlanmıştır.")
                .FontSize(8).FontColor(Colors.Grey.Medium);
        });
    }
}

