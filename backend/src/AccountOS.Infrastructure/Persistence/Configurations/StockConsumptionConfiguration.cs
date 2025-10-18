using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// StockConsumption entity konfigürasyonu
/// </summary>
public class StockConsumptionConfiguration : IEntityTypeConfiguration<StockConsumption>
{
    public void Configure(EntityTypeBuilder<StockConsumption> builder)
    {
        builder.ToTable("stock_consumptions");

        builder.HasKey(sc => sc.Id);

        builder.Property(sc => sc.StockLayerId)
            .IsRequired()
            .HasColumnName("stock_layer_id");

        builder.Property(sc => sc.ConsumptionDate)
            .HasColumnName("consumption_date");

        builder.Property(sc => sc.ReferenceType)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("reference_type");

        builder.Property(sc => sc.ReferenceId)
            .HasColumnName("reference_id");

        builder.Property(sc => sc.Quantity)
            .HasPrecision(18, 2)
            .HasColumnName("quantity");

        builder.Property(sc => sc.UnitCost)
            .HasPrecision(18, 6)
            .HasColumnName("unit_cost");

        builder.Property(sc => sc.TotalCost)
            .HasPrecision(18, 6)
            .HasColumnName("total_cost");

        // Audit fields
        builder.Property(sc => sc.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(sc => sc.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(sc => sc.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(sc => sc.UpdatedBy)
            .HasColumnName("updated_by");

        builder.Property(sc => sc.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(sc => sc.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(sc => sc.DeletedBy)
            .HasColumnName("deleted_by");

        builder.Property(sc => sc.RowVersion)
            .IsRowVersion()
            .HasColumnName("row_version");

        // Index
        builder.HasIndex(sc => new { sc.StockLayerId, sc.ConsumptionDate })
            .HasDatabaseName("ix_stock_consumptions_layer_date");
    }
}

