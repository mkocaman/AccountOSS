using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// ProductTranslation entity konfigürasyonu
/// </summary>
public class ProductTranslationConfiguration : IEntityTypeConfiguration<ProductTranslation>
{
    public void Configure(EntityTypeBuilder<ProductTranslation> builder)
    {
        builder.ToTable("product_translations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.ProductId)
            .IsRequired()
            .HasColumnName("product_id");

        builder.Property(t => t.LanguageCode)
            .IsRequired()
            .HasMaxLength(2)
            .HasColumnName("language_code");

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(t => t.Description)
            .HasColumnType("text")
            .HasColumnName("description");

        // Unique constraint: Bir ürün için aynı dilde sadece bir çeviri
        builder.HasIndex(t => new { t.ProductId, t.LanguageCode })
            .IsUnique()
            .HasDatabaseName("ix_product_translations_product_language");
    }
}

