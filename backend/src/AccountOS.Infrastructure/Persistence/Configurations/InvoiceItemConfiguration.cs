using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// InvoiceItem entity konfigürasyonu
/// </summary>
public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.ToTable("invoice_items");

        builder.HasKey(ii => ii.Id);

        // Properties
        builder.Property(ii => ii.InvoiceId)
            .IsRequired();

        builder.Property(ii => ii.ProductId)
            .IsRequired();

        builder.Property(ii => ii.LineNumber)
            .IsRequired();

        builder.Property(ii => ii.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ii => ii.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ii => ii.Description)
            .HasMaxLength(500);

        builder.Property(ii => ii.Quantity)
            .HasPrecision(18, 2);

        builder.Property(ii => ii.Unit)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(ii => ii.UnitPrice)
            .HasPrecision(18, 2);

        builder.Property(ii => ii.DiscountPercentage)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(ii => ii.DiscountAmount)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(ii => ii.VatRate)
            .HasPrecision(5, 2)
            .HasDefaultValue(0m);

        builder.Property(ii => ii.SubTotal)
            .HasPrecision(18, 2);

        builder.Property(ii => ii.VatAmount)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(ii => ii.Total)
            .HasPrecision(18, 2);

        builder.Property(ii => ii.FifoCost)
            .HasPrecision(18, 6);

        // Relationships
        builder.HasOne(ii => ii.Invoice)
            .WithMany(i => i.Items)
            .HasForeignKey(ii => ii.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ii => ii.Product)
            .WithMany()
            .HasForeignKey(ii => ii.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(ii => new { ii.InvoiceId, ii.LineNumber })
            .HasDatabaseName("IX_invoice_items_invoice_line");

        builder.HasIndex(ii => ii.ProductId)
            .HasDatabaseName("IX_invoice_items_product_id");

        // Audit fields
        builder.Property(ii => ii.CreatedAt)
            .IsRequired();

        builder.Property(ii => ii.CreatedBy)
            .IsRequired();

        builder.Property(ii => ii.UpdatedAt);

        builder.Property(ii => ii.UpdatedBy);

        builder.Property(ii => ii.IsDeleted)
            .HasDefaultValue(false);

        builder.Property(ii => ii.DeletedAt);

        builder.Property(ii => ii.DeletedBy);

        builder.Property(ii => ii.RowVersion)
            .IsRowVersion();
    }
}
