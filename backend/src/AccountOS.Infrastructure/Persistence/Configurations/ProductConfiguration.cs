using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Product entity konfigürasyonu
/// </summary>
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);

        // Tenant Entity
        builder.Property(p => p.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(p => p.Code)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("code");

        builder.Property(p => p.Barcode)
            .HasMaxLength(100)
            .HasColumnName("barcode");

        builder.Property(p => p.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("type");

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(p => p.Description)
            .HasColumnType("text")
            .HasColumnName("description");

        // Fiyatlandırma
        builder.Property(p => p.PurchasePrice)
            .HasPrecision(18, 2)
            .HasColumnName("purchase_price");

        builder.Property(p => p.SalePrice)
            .HasPrecision(18, 2)
            .HasColumnName("sale_price");

        builder.Property(p => p.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(p => p.VatRate)
            .HasPrecision(5, 2)
            .HasColumnName("vat_rate");

        // Stok
        builder.Property(p => p.Unit)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("unit");

        builder.Property(p => p.TrackStock)
            .HasColumnName("track_stock");

        builder.Property(p => p.MinStockLevel)
            .HasPrecision(18, 2)
            .HasColumnName("min_stock_level");

        builder.Property(p => p.StockQuantity)
            .HasPrecision(18, 2)
            .HasColumnName("stock_quantity");

        // Durum
        builder.Property(p => p.IsActive)
            .HasColumnName("is_active");

        builder.Property(p => p.IsForSale)
            .HasColumnName("is_for_sale");

        builder.Property(p => p.IsForPurchase)
            .HasColumnName("is_for_purchase");

        builder.Property(p => p.ImageUrl)
            .HasMaxLength(500)
            .HasColumnName("image_url");

        // Audit fields
        builder.Property(p => p.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(p => p.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(p => p.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(p => p.UpdatedBy)
            .HasColumnName("updated_by");

        builder.Property(p => p.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(p => p.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(p => p.DeletedBy)
            .HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(p => new { p.CompanyId, p.Code })
            .IsUnique()
            .HasDatabaseName("ix_products_company_code");

        builder.HasIndex(p => new { p.CompanyId, p.Name })
            .HasDatabaseName("ix_products_company_name");

        builder.HasIndex(p => p.Barcode)
            .HasDatabaseName("ix_products_barcode");

        // Foreign Key
        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);

        // Navigation: Translations
        builder.HasMany(p => p.Translations)
            .WithOne(t => t.Product)
            .HasForeignKey(t => t.ProductId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

