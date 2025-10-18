using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class ChartOfAccountConfiguration : IEntityTypeConfiguration<ChartOfAccount>
{
    public void Configure(EntityTypeBuilder<ChartOfAccount> builder)
    {
        builder.ToTable("chart_of_accounts");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(c => c.AccountCode)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("account_code");

        builder.Property(c => c.AccountName)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("account_name");

        builder.Property(c => c.AccountType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("account_type");

        builder.Property(c => c.ParentAccountId)
            .HasColumnName("parent_account_id");

        builder.Property(c => c.Level)
            .IsRequired()
            .HasColumnName("level");

        builder.Property(c => c.NormalBalance)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("normal_balance");

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(c => c.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        builder.Property(c => c.IsSystemAccount)
            .IsRequired()
            .HasColumnName("is_system_account");

        builder.Property(c => c.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        // Audit fields
        builder.Property(c => c.CreatedAt).HasColumnName("created_at");
        builder.Property(c => c.CreatedBy).HasColumnName("created_by");
        builder.Property(c => c.UpdatedAt).HasColumnName("updated_at");
        builder.Property(c => c.UpdatedBy).HasColumnName("updated_by");
        builder.Property(c => c.IsDeleted).HasColumnName("is_deleted");
        builder.Property(c => c.DeletedAt).HasColumnName("deleted_at");
        builder.Property(c => c.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(c => new { c.CompanyId, c.AccountCode })
            .IsUnique()
            .HasDatabaseName("ix_chart_of_accounts_company_code");

        builder.HasIndex(c => new { c.CompanyId, c.AccountType, c.IsActive })
            .HasDatabaseName("ix_chart_of_accounts_company_type_active");

        builder.HasIndex(c => c.ParentAccountId)
            .HasDatabaseName("ix_chart_of_accounts_parent");

        // Foreign Keys
        builder.HasOne(c => c.ParentAccount)
            .WithMany(c => c.SubAccounts)
            .HasForeignKey(c => c.ParentAccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

