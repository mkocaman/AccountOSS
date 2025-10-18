using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class DocumentNumberingTemplateConfiguration : IEntityTypeConfiguration<DocumentNumberingTemplate>
{
    public void Configure(EntityTypeBuilder<DocumentNumberingTemplate> builder)
    {
        builder.ToTable("document_numbering_templates");

        builder.HasKey(t => t.Id);

        // Properties
        builder.Property(t => t.DocumentType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.SubType)
            .HasMaxLength(50);

        builder.Property(t => t.Template)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Prefix)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(t => t.IncludeYear)
            .IsRequired();

        builder.Property(t => t.YearFormat)
            .HasMaxLength(10);

        builder.Property(t => t.IncludeMonth)
            .IsRequired();

        builder.Property(t => t.MonthFormat)
            .HasMaxLength(10);

        builder.Property(t => t.SequenceLength)
            .IsRequired();

        builder.Property(t => t.StartingNumber)
            .IsRequired();

        builder.Property(t => t.CurrentSequence)
            .IsRequired();

        builder.Property(t => t.ResetFrequency)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(t => t.LastResetDate);

        builder.Property(t => t.ExampleOutput)
            .HasMaxLength(100);

        builder.Property(t => t.IsActive)
            .IsRequired();

        // Indexes
        builder.HasIndex(t => new { t.CompanyId, t.DocumentType, t.SubType })
            .IsUnique()
            .HasDatabaseName("IX_doc_numbering_company_type");

        // Audit fields
        builder.Property(t => t.CreatedAt).IsRequired();
        builder.Property(t => t.CreatedBy).IsRequired();
        builder.Property(t => t.UpdatedAt);
        builder.Property(t => t.UpdatedBy);
        builder.Property(t => t.IsDeleted).HasDefaultValue(false);
        builder.Property(t => t.DeletedAt);
        builder.Property(t => t.DeletedBy);
        builder.Property(t => t.RowVersion).IsRowVersion();
    }
}

