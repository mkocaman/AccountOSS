using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class EmailLogConfiguration : IEntityTypeConfiguration<EmailLog>
{
    public void Configure(EntityTypeBuilder<EmailLog> builder)
    {
        builder.ToTable("email_logs");

        builder.HasKey(l => l.Id);

        // Properties
        builder.Property(l => l.ToEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(l => l.ToName)
            .HasMaxLength(255);

        builder.Property(l => l.CcEmails)
            .HasMaxLength(1000);

        builder.Property(l => l.BccEmails)
            .HasMaxLength(1000);

        builder.Property(l => l.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(l => l.HtmlBody)
            .IsRequired();

        builder.Property(l => l.PlainTextBody);

        builder.Property(l => l.TemplateType)
            .HasConversion<int?>();

        builder.Property(l => l.TemplateId);

        builder.Property(l => l.RelatedEntityId);

        builder.Property(l => l.RelatedEntityType)
            .HasMaxLength(100);

        builder.Property(l => l.AttachmentNames);

        builder.Property(l => l.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(l => l.AttemptCount)
            .IsRequired();

        builder.Property(l => l.SentAt);

        builder.Property(l => l.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(l => l.LastAttemptAt);

        builder.Property(l => l.NextRetryAt);

        // Relationships
        builder.HasOne(l => l.Template)
            .WithMany()
            .HasForeignKey(l => l.TemplateId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(l => new { l.CompanyId, l.Status, l.NextRetryAt })
            .HasDatabaseName("IX_email_logs_retry_queue");

        builder.HasIndex(l => new { l.CompanyId, l.ToEmail, l.CreatedAt })
            .HasDatabaseName("IX_email_logs_company_recipient");

        builder.HasIndex(l => new { l.RelatedEntityId, l.RelatedEntityType })
            .HasDatabaseName("IX_email_logs_related_entity");

        // Audit fields
        builder.Property(l => l.CreatedAt).IsRequired();
        builder.Property(l => l.CreatedBy).IsRequired();
        builder.Property(l => l.UpdatedAt);
        builder.Property(l => l.UpdatedBy);
        builder.Property(l => l.IsDeleted).HasDefaultValue(false);
        builder.Property(l => l.DeletedAt);
        builder.Property(l => l.DeletedBy);
        builder.Property(l => l.RowVersion).IsRowVersion();
    }
}

