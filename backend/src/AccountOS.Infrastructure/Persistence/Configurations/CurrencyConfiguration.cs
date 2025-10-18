using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Currency entity konfigürasyonu
/// </summary>
public class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("currencies");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("code");

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("name");

        builder.Property(c => c.Symbol)
            .IsRequired()
            .HasMaxLength(10)
            .HasColumnName("symbol");

        builder.Property(c => c.DecimalPlaces)
            .HasColumnName("decimal_places");

        builder.Property(c => c.IsActive)
            .HasColumnName("is_active");

        builder.Property(c => c.DisplayOrder)
            .HasColumnName("display_order");

        // Unique constraint on Code
        builder.HasIndex(c => c.Code)
            .IsUnique()
            .HasDatabaseName("ix_currencies_code");

        // Navigation properties
        builder.HasMany(c => c.FxRatesAsBase)
            .WithOne(f => f.BaseCurrency)
            .HasForeignKey(f => f.BaseCurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.FxRatesAsQuote)
            .WithOne(f => f.QuoteCurrency)
            .HasForeignKey(f => f.QuoteCurrencyCode)
            .HasPrincipalKey(c => c.Code)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

