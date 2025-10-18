using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Payment entity konfigürasyonu
/// </summary>
public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable("payments");

        builder.HasKey(p => p.Id);

        // Properties
        builder.Property(p => p.PaymentNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(p => p.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.CustomerId)
            .IsRequired();

        builder.Property(p => p.InvoiceId);

        builder.Property(p => p.PaymentDate)
            .IsRequired();

        builder.Property(p => p.Method)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2);

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.ExchangeRate)
            .HasPrecision(18, 6);

        builder.Property(p => p.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(p => p.AmountInBase)
            .HasPrecision(18, 2);

        builder.Property(p => p.BankAccount)
            .HasMaxLength(100);

        builder.Property(p => p.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(p => p.Customer)
            .WithMany()
            .HasForeignKey(p => p.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Invoice)
            .WithMany()
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(p => new { p.CompanyId, p.PaymentNumber })
            .IsUnique()
            .HasDatabaseName("IX_payments_company_number");

        builder.HasIndex(p => new { p.CompanyId, p.CustomerId, p.PaymentDate })
            .HasDatabaseName("IX_payments_company_customer_date");

        builder.HasIndex(p => p.InvoiceId)
            .HasDatabaseName("IX_payments_invoice");

        // Audit fields
        builder.Property(p => p.CreatedAt)
            .IsRequired();

        builder.Property(p => p.CreatedBy)
            .IsRequired();

        builder.Property(p => p.UpdatedAt);

        builder.Property(p => p.UpdatedBy);

        builder.Property(p => p.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(p => p.DeletedAt);

        builder.Property(p => p.DeletedBy);

        builder.Property(p => p.RowVersion)
            .IsRowVersion();
    }
}

