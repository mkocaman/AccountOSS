using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("notification_templates");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("code");

        builder.Property(t => t.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("type");

        builder.Property(t => t.TitleTemplate)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("title_template");

        builder.Property(t => t.MessageTemplate)
            .IsRequired()
            .HasMaxLength(2000)
            .HasColumnName("message_template");

        builder.Property(t => t.DefaultPriority)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("default_priority");

        builder.Property(t => t.ActionUrlTemplate)
            .HasMaxLength(1000)
            .HasColumnName("action_url_template");

        builder.Property(t => t.Icon)
            .HasMaxLength(100)
            .HasColumnName("icon");

        builder.Property(t => t.Color)
            .HasMaxLength(50)
            .HasColumnName("color");

        builder.Property(t => t.SendEmail)
            .IsRequired()
            .HasColumnName("send_email");

        builder.Property(t => t.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        builder.Property(t => t.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        // Audit fields
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");
        builder.Property(t => t.IsDeleted).HasColumnName("is_deleted");
        builder.Property(t => t.DeletedAt).HasColumnName("deleted_at");
        builder.Property(t => t.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(t => new { t.CompanyId, t.Code })
            .IsUnique()
            .HasDatabaseName("ix_notification_templates_company_code");

        builder.HasIndex(t => new { t.CompanyId, t.Type, t.IsActive })
            .HasDatabaseName("ix_notification_templates_company_type_active");

    }
}

