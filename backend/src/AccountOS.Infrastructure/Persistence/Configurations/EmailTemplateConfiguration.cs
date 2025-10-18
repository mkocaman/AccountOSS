using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class EmailTemplateConfiguration : IEntityTypeConfiguration<EmailTemplate>
{
    public void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        builder.ToTable("email_templates");

        builder.HasKey(t => t.Id);

        // Properties
        builder.Property(t => t.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(t => t.HtmlBody)
            .IsRequired();

        builder.Property(t => t.PlainTextBody);

        builder.Property(t => t.IsDefault)
            .IsRequired();

        builder.Property(t => t.IsActive)
            .IsRequired();

        builder.Property(t => t.Description)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(t => new { t.CompanyId, t.Type })
            .HasDatabaseName("IX_email_templates_company_type");

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

