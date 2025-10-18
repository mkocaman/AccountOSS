using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class ExpenseConfiguration : IEntityTypeConfiguration<Expense>
{
    public void Configure(EntityTypeBuilder<Expense> builder)
    {
        builder.ToTable("expenses");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.ExpenseNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(e => e.CategoryId)
            .IsRequired();

        builder.Property(e => e.SupplierId);

        builder.Property(e => e.ExpenseDate)
            .IsRequired();

        builder.Property(e => e.PaymentDate);

        builder.Property(e => e.Title)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.Description)
            .HasMaxLength(2000);

        builder.Property(e => e.Amount)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(e => e.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.ExchangeRate)
            .IsRequired()
            .HasPrecision(18, 6);

        builder.Property(e => e.BaseCurrency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(e => e.AmountInBase)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.Property(e => e.VatAmount)
            .HasPrecision(18, 2);

        builder.Property(e => e.VatRate)
            .HasPrecision(5, 2);

        builder.Property(e => e.PaymentMethod)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.ApprovalStatus)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.ApprovedBy);

        builder.Property(e => e.ApprovedAt);

        builder.Property(e => e.RejectionReason)
            .HasMaxLength(1000);

        builder.Property(e => e.InvoiceNumber)
            .HasMaxLength(100);

        builder.Property(e => e.ReferenceNumber)
            .HasMaxLength(100);

        builder.Property(e => e.IsRecurring)
            .IsRequired();

        builder.Property(e => e.RecurringFrequency)
            .HasConversion<int?>();

        builder.Property(e => e.RecurringEndDate);

        builder.Property(e => e.ProjectId);

        builder.Property(e => e.AttachmentIds)
            .HasColumnType("jsonb");

        builder.Property(e => e.Notes)
            .HasMaxLength(2000);

        builder.Property(e => e.Tags)
            .HasColumnType("jsonb");

        // Audit fields
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.CreatedBy).IsRequired();
        builder.Property(e => e.UpdatedAt);
        builder.Property(e => e.UpdatedBy);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy);
        builder.Property(e => e.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(e => new { e.CompanyId, e.ExpenseNumber })
            .IsUnique()
            .HasDatabaseName("IX_expenses_company_number");

        builder.HasIndex(e => new { e.CompanyId, e.ExpenseDate })
            .HasDatabaseName("IX_expenses_company_date");

        builder.HasIndex(e => new { e.CompanyId, e.CategoryId })
            .HasDatabaseName("IX_expenses_company_category");

        builder.HasIndex(e => new { e.CompanyId, e.Status })
            .HasDatabaseName("IX_expenses_company_status");

        // Relationships
        builder.HasOne(e => e.Category)
            .WithMany(c => c.Expenses)
            .HasForeignKey(e => e.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Supplier)
            .WithMany()
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Approver)
            .WithMany()
            .HasForeignKey(e => e.ApprovedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

