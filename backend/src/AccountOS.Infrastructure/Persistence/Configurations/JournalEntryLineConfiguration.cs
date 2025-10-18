using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class JournalEntryLineConfiguration : IEntityTypeConfiguration<JournalEntryLine>
{
    public void Configure(EntityTypeBuilder<JournalEntryLine> builder)
    {
        builder.ToTable("journal_entry_lines");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.JournalEntryId)
            .IsRequired()
            .HasColumnName("journal_entry_id");

        builder.Property(l => l.AccountId)
            .IsRequired()
            .HasColumnName("account_id");

        builder.Property(l => l.LineNumber)
            .IsRequired()
            .HasColumnName("line_number");

        builder.Property(l => l.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        builder.Property(l => l.DebitAmount)
            .IsRequired()
            .HasColumnName("debit_amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(l => l.CreditAmount)
            .IsRequired()
            .HasColumnName("credit_amount")
            .HasColumnType("decimal(18,2)");

        builder.Property(l => l.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(l => l.ExchangeRate)
            .HasColumnName("exchange_rate")
            .HasColumnType("decimal(18,6)");

        builder.Property(l => l.BaseCurrencyAmount)
            .HasColumnName("base_currency_amount")
            .HasColumnType("decimal(18,2)");

        // Audit fields
        builder.Property(l => l.CreatedAt).HasColumnName("created_at");
        builder.Property(l => l.CreatedBy).HasColumnName("created_by");
        builder.Property(l => l.UpdatedAt).HasColumnName("updated_at");
        builder.Property(l => l.UpdatedBy).HasColumnName("updated_by");

        // Indexes
        builder.HasIndex(l => new { l.JournalEntryId, l.LineNumber })
            .HasDatabaseName("ix_journal_entry_lines_entry_line");

        builder.HasIndex(l => l.AccountId)
            .HasDatabaseName("ix_journal_entry_lines_account");

        // Foreign Keys
        builder.HasOne(l => l.JournalEntry)
            .WithMany(j => j.Lines)
            .HasForeignKey(l => l.JournalEntryId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Account)
            .WithMany(a => a.JournalEntries)
            .HasForeignKey(l => l.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

