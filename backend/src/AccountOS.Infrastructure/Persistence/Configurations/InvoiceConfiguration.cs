using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Invoice entity konfigürasyonu
/// </summary>
public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.ToTable("invoices");

        builder.HasKey(i => i.Id);

        // Properties
        builder.Property(i => i.InvoiceNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(i => i.CustomerId)
            .IsRequired();

        builder.Property(i => i.InvoiceDate)
            .IsRequired();

        builder.Property(i => i.DueDate);

        builder.Property(i => i.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(i => i.ExchangeRate)
            .HasPrecision(18, 6)
            .HasDefaultValue(1m);

        builder.Property(i => i.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(i => i.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.VatTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.GrandTotal)
            .HasPrecision(18, 2);

        builder.Property(i => i.GrandTotalInBase)
            .HasPrecision(18, 2);

        builder.Property(i => i.PaidAmount)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(i => i.RemainingAmount)
            .HasPrecision(18, 2);

        builder.Property(i => i.Status)
            .IsRequired()
            .HasConversion<int>()
            .HasDefaultValue(InvoiceStatus.Draft);

        builder.Property(i => i.Notes)
            .HasMaxLength(2000);

        // Relationships
        builder.HasOne(i => i.Customer)
            .WithMany()
            .HasForeignKey(i => i.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(i => i.Items)
            .WithOne(ii => ii.Invoice)
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(i => new { i.CompanyId, i.InvoiceNumber })
            .IsUnique()
            .HasDatabaseName("IX_invoices_company_id_invoice_number");

        builder.HasIndex(i => new { i.CompanyId, i.CustomerId, i.InvoiceDate })
            .HasDatabaseName("IX_invoices_company_customer_date");

        builder.HasIndex(i => i.Status)
            .HasDatabaseName("IX_invoices_status");

        builder.HasIndex(i => i.DueDate)
            .HasDatabaseName("IX_invoices_due_date");

        builder.HasIndex(i => new { i.CompanyId, i.InvoiceDate })
            .HasDatabaseName("IX_invoices_company_date");

        // Audit fields
        builder.Property(i => i.CreatedAt)
            .IsRequired();

        builder.Property(i => i.CreatedBy)
            .IsRequired();

        builder.Property(i => i.UpdatedAt);

        builder.Property(i => i.UpdatedBy);

        builder.Property(i => i.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(i => i.DeletedAt);

        builder.Property(i => i.DeletedBy);

        builder.Property(i => i.RowVersion)
            .IsRowVersion();
    }
}
