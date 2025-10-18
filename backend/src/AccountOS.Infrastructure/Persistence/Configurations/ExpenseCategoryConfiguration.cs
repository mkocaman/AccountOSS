using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class ExpenseCategoryConfiguration : IEntityTypeConfiguration<ExpenseCategory>
{
    public void Configure(EntityTypeBuilder<ExpenseCategory> builder)
    {
        builder.ToTable("expense_categories");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(c => c.Description)
            .HasMaxLength(1000);

        builder.Property(c => c.ParentCategoryId);

        builder.Property(c => c.MonthlyBudget)
            .HasPrecision(18, 2);

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(c => c.ColorCode)
            .HasMaxLength(20);

        builder.Property(c => c.IsActive)
            .IsRequired();

        builder.Property(c => c.DisplayOrder)
            .IsRequired();

        // Audit fields
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.CreatedBy).IsRequired();
        builder.Property(c => c.UpdatedAt);
        builder.Property(c => c.UpdatedBy);
        builder.Property(c => c.IsDeleted).HasDefaultValue(false);
        builder.Property(c => c.DeletedAt);
        builder.Property(c => c.DeletedBy);
        builder.Property(c => c.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(c => new { c.CompanyId, c.Code })
            .IsUnique()
            .HasDatabaseName("IX_expense_categories_company_code");

        builder.HasIndex(c => new { c.CompanyId, c.IsActive })
            .HasDatabaseName("IX_expense_categories_company_active");

        // Relationships
        builder.HasOne(c => c.ParentCategory)
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

