using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// FxRate entity konfigürasyonu
/// </summary>
public class FxRateConfiguration : IEntityTypeConfiguration<FxRate>
{
    public void Configure(EntityTypeBuilder<FxRate> builder)
    {
        builder.ToTable("fx_rates");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.BaseCurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("base_currency_code");

        builder.Property(f => f.QuoteCurrencyCode)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("quote_currency_code");

        builder.Property(f => f.Rate)
            .HasPrecision(18, 6)
            .HasColumnName("rate");

        builder.Property(f => f.EffectiveDate)
            .HasColumnName("effective_date");

        builder.Property(f => f.Source)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("source");

        builder.Property(f => f.IsManual)
            .HasColumnName("is_manual");

        // Composite index for fast lookups
        builder.HasIndex(f => new { f.BaseCurrencyCode, f.QuoteCurrencyCode, f.EffectiveDate })
            .HasDatabaseName("ix_fx_rates_currencies_date");

        // Audit fields
        builder.Property(f => f.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(f => f.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(f => f.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(f => f.UpdatedBy)
            .HasColumnName("updated_by");
    }
}

