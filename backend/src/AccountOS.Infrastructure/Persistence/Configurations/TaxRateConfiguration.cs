using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class TaxRateConfiguration : IEntityTypeConfiguration<TaxRate>
{
    public void Configure(EntityTypeBuilder<TaxRate> builder)
    {
        builder.ToTable("tax_rates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(t => t.TaxType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("tax_type");

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("code");

        builder.Property(t => t.Rate)
            .IsRequired()
            .HasColumnName("rate")
            .HasColumnType("decimal(5,2)");

        builder.Property(t => t.EffectiveFrom)
            .IsRequired()
            .HasColumnName("effective_from");

        builder.Property(t => t.EffectiveTo)
            .HasColumnName("effective_to");

        builder.Property(t => t.CountryCode)
            .IsRequired()
            .HasMaxLength(2)
            .HasColumnName("country_code");

        builder.Property(t => t.IsDefault)
            .IsRequired()
            .HasColumnName("is_default");

        builder.Property(t => t.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        builder.Property(t => t.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        // Audit fields
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted");
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at");
        builder.Property(t => t.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(t => new { t.CompanyId, t.Code })
            .IsUnique()
            .HasDatabaseName("ix_tax_rates_company_code");

        builder.HasIndex(t => new { t.CompanyId, t.TaxType, t.IsActive })
            .HasDatabaseName("ix_tax_rates_company_type_active");

        builder.HasIndex(t => new { t.EffectiveFrom, t.EffectiveTo })
            .HasDatabaseName("ix_tax_rates_effective_dates");
    }
}

