using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// StockLayer entity konfigürasyonu
/// </summary>
public class StockLayerConfiguration : IEntityTypeConfiguration<StockLayer>
{
    public void Configure(EntityTypeBuilder<StockLayer> builder)
    {
        builder.ToTable("stock_layers");

        builder.HasKey(sl => sl.Id);

        builder.Property(sl => sl.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(sl => sl.ProductId)
            .IsRequired()
            .HasColumnName("product_id");

        builder.Property(sl => sl.EntryDate)
            .HasColumnName("entry_date");

        builder.Property(sl => sl.ReferenceType)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("reference_type");

        builder.Property(sl => sl.ReferenceId)
            .HasColumnName("reference_id");

        builder.Property(sl => sl.EntryQuantity)
            .HasPrecision(18, 2)
            .HasColumnName("entry_quantity");

        builder.Property(sl => sl.RemainingQuantity)
            .HasPrecision(18, 2)
            .HasColumnName("remaining_quantity");

        builder.Property(sl => sl.UnitCost)
            .HasPrecision(18, 6)
            .HasColumnName("unit_cost");

        builder.Property(sl => sl.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(sl => sl.UnitCostInBase)
            .HasPrecision(18, 6)
            .HasColumnName("unit_cost_in_base");

        builder.Property(sl => sl.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("base_currency");

        builder.Property(sl => sl.ExchangeRate)
            .HasPrecision(18, 6)
            .HasColumnName("exchange_rate");

        // Audit fields
        builder.Property(sl => sl.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(sl => sl.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(sl => sl.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(sl => sl.UpdatedBy)
            .HasColumnName("updated_by");

        builder.Property(sl => sl.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(sl => sl.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(sl => sl.DeletedBy)
            .HasColumnName("deleted_by");

        builder.Property(sl => sl.RowVersion)
            .IsRowVersion()
            .HasColumnName("row_version");

        // Indexes
        builder.HasIndex(sl => new { sl.CompanyId, sl.ProductId, sl.EntryDate })
            .HasDatabaseName("ix_stock_layers_company_product_date");

        builder.HasIndex(sl => sl.RemainingQuantity)
            .HasDatabaseName("ix_stock_layers_remaining_quantity")
            .HasFilter("remaining_quantity > 0");

        // Foreign Keys
        builder.HasOne(sl => sl.Product)
            .WithMany()
            .HasForeignKey(sl => sl.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // Navigation
        builder.HasMany(sl => sl.Consumptions)
            .WithOne(sc => sc.StockLayer)
            .HasForeignKey(sc => sc.StockLayerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

