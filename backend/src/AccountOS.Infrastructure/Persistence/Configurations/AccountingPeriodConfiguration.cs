using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class AccountingPeriodConfiguration : IEntityTypeConfiguration<AccountingPeriod>
{
    public void Configure(EntityTypeBuilder<AccountingPeriod> builder)
    {
        builder.ToTable("accounting_periods");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(p => p.PeriodName)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("period_name");

        builder.Property(p => p.PeriodCode)
            .IsRequired()
            .HasMaxLength(20)
            .HasColumnName("period_code");

        builder.Property(p => p.StartDate)
            .IsRequired()
            .HasColumnName("start_date");

        builder.Property(p => p.EndDate)
            .IsRequired()
            .HasColumnName("end_date");

        builder.Property(p => p.FiscalYear)
            .IsRequired()
            .HasColumnName("fiscal_year");

        builder.Property(p => p.PeriodType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("period_type");

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("status");

        builder.Property(p => p.ClosedAt)
            .HasColumnName("closed_at");

        builder.Property(p => p.ClosedBy)
            .HasColumnName("closed_by");

        builder.Property(p => p.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        // Audit fields
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.CreatedBy).HasColumnName("created_by");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedBy).HasColumnName("updated_by");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted");
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(p => new { p.CompanyId, p.PeriodCode })
            .IsUnique()
            .HasDatabaseName("ix_accounting_periods_company_code");

        builder.HasIndex(p => new { p.CompanyId, p.FiscalYear, p.Status })
            .HasDatabaseName("ix_accounting_periods_company_year_status");

        builder.HasIndex(p => new { p.StartDate, p.EndDate })
            .HasDatabaseName("ix_accounting_periods_dates");
    }
}

