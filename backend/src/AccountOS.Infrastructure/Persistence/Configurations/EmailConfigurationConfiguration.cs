using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class EmailConfigurationConfiguration : IEntityTypeConfiguration<EmailConfiguration>
{
    public void Configure(EntityTypeBuilder<EmailConfiguration> builder)
    {
        builder.ToTable("email_configurations");

        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.SmtpHost)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.SmtpPort)
            .IsRequired();

        builder.Property(e => e.UseSsl)
            .IsRequired();

        builder.Property(e => e.Username)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.Password)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.SenderName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.SenderEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(e => e.DefaultCc)
            .HasMaxLength(500);

        builder.Property(e => e.DefaultBcc)
            .HasMaxLength(500);

        builder.Property(e => e.IsActive)
            .IsRequired();

        builder.Property(e => e.IsTested)
            .IsRequired();

        builder.Property(e => e.LastTestedAt);

        // Indexes
        builder.HasIndex(e => e.CompanyId)
            .HasDatabaseName("IX_email_config_company");

        // Audit fields
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.CreatedBy).IsRequired();
        builder.Property(e => e.UpdatedAt);
        builder.Property(e => e.UpdatedBy);
        builder.Property(e => e.IsDeleted).HasDefaultValue(false);
        builder.Property(e => e.DeletedAt);
        builder.Property(e => e.DeletedBy);
        builder.Property(e => e.RowVersion).IsRowVersion();
    }
}

