using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// StockMovement entity konfigürasyonu
/// </summary>
public class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(sm => sm.Id);

        builder.Property(sm => sm.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(sm => sm.ProductId)
            .IsRequired()
            .HasColumnName("product_id");

        builder.Property(sm => sm.MovementDate)
            .HasColumnName("movement_date");

        builder.Property(sm => sm.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("type");

        builder.Property(sm => sm.ReferenceType)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("reference_type");

        builder.Property(sm => sm.ReferenceId)
            .HasColumnName("reference_id");

        builder.Property(sm => sm.Quantity)
            .HasPrecision(18, 2)
            .HasColumnName("quantity");

        builder.Property(sm => sm.UnitCost)
            .HasPrecision(18, 6)
            .HasColumnName("unit_cost");

        builder.Property(sm => sm.TotalCost)
            .HasPrecision(18, 6)
            .HasColumnName("total_cost");

        builder.Property(sm => sm.BalanceAfter)
            .HasPrecision(18, 2)
            .HasColumnName("balance_after");

        builder.Property(sm => sm.Description)
            .HasMaxLength(500)
            .HasColumnName("description");

        // Audit fields
        builder.Property(sm => sm.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(sm => sm.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(sm => sm.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(sm => sm.UpdatedBy)
            .HasColumnName("updated_by");

        builder.Property(sm => sm.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(sm => sm.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(sm => sm.DeletedBy)
            .HasColumnName("deleted_by");

        builder.Property(sm => sm.RowVersion)
            .IsRowVersion()
            .HasColumnName("row_version");

        // Indexes
        builder.HasIndex(sm => new { sm.CompanyId, sm.ProductId, sm.MovementDate })
            .HasDatabaseName("ix_stock_movements_company_product_date");

        builder.HasIndex(sm => sm.Type)
            .HasDatabaseName("ix_stock_movements_type");

        // Foreign Keys
        builder.HasOne(sm => sm.Product)
            .WithMany()
            .HasForeignKey(sm => sm.ProductId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

