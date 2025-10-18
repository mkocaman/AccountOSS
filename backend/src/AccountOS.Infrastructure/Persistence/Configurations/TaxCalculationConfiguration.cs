using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class TaxCalculationConfiguration : IEntityTypeConfiguration<TaxCalculation>
{
    public void Configure(EntityTypeBuilder<TaxCalculation> builder)
    {
        builder.ToTable("tax_calculations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(t => t.EntityType)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("entity_type");

        builder.Property(t => t.EntityId)
            .IsRequired()
            .HasColumnName("entity_id");

        builder.Property(t => t.TaxType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("tax_type");

        builder.Property(t => t.TaxRateId)
            .IsRequired()
            .HasColumnName("tax_rate_id");

        builder.Property(t => t.TaxBase)
            .IsRequired()
            .HasColumnName("tax_base")
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.Rate)
            .IsRequired()
            .HasColumnName("rate")
            .HasColumnType("decimal(5,2)");

        builder.Property(t => t.TaxAmount)
            .IsRequired()
            .HasColumnName("tax_amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(t => t.CalculationDate)
            .IsRequired()
            .HasColumnName("calculation_date");

        builder.Property(t => t.CalculationDetails)
            .HasColumnName("calculation_details")
            .HasColumnType("jsonb");

        // Audit fields
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted");
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at");
        builder.Property(t => t.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(t => new { t.EntityType, t.EntityId })
            .HasDatabaseName("ix_tax_calculations_entity");

        builder.HasIndex(t => new { t.CompanyId, t.CalculationDate })
            .HasDatabaseName("ix_tax_calculations_company_date");

        // Foreign Keys
        builder.HasOne(t => t.TaxRate)
            .WithMany()
            .HasForeignKey(t => t.TaxRateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

