using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(n => n.UserId)
            .IsRequired()
            .HasColumnName("user_id");

        builder.Property(n => n.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("type");

        builder.Property(n => n.Priority)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("priority");

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("title");

        builder.Property(n => n.Message)
            .IsRequired()
            .HasMaxLength(2000)
            .HasColumnName("message");

        builder.Property(n => n.EntityType)
            .HasMaxLength(100)
            .HasColumnName("entity_type");

        builder.Property(n => n.EntityId)
            .HasColumnName("entity_id");

        builder.Property(n => n.EntityName)
            .HasMaxLength(500)
            .HasColumnName("entity_name");

        builder.Property(n => n.ActionUrl)
            .HasMaxLength(1000)
            .HasColumnName("action_url");

        builder.Property(n => n.Icon)
            .HasMaxLength(100)
            .HasColumnName("icon");

        builder.Property(n => n.Color)
            .HasMaxLength(50)
            .HasColumnName("color");

        builder.Property(n => n.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("jsonb");

        builder.Property(n => n.IsRead)
            .IsRequired()
            .HasColumnName("is_read");

        builder.Property(n => n.ReadAt)
            .HasColumnName("read_at");

        builder.Property(n => n.EmailSent)
            .IsRequired()
            .HasColumnName("email_sent");

        builder.Property(n => n.EmailSentAt)
            .HasColumnName("email_sent_at");

        builder.Property(n => n.LastViewedAt)
            .HasColumnName("last_viewed_at");

        builder.Property(n => n.ExpiresAt)
            .HasColumnName("expires_at");

        // Audit fields
        builder.Property(n => n.CreatedAt).HasColumnName("created_at");
        builder.Property(n => n.CreatedBy).HasColumnName("created_by");
        builder.Property(n => n.UpdatedAt).HasColumnName("updated_at");
        builder.Property(n => n.UpdatedBy).HasColumnName("updated_by");
        builder.Property(n => n.IsDeleted).HasColumnName("is_deleted");
        builder.Property(n => n.DeletedAt).HasColumnName("deleted_at");
        builder.Property(n => n.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(n => new { n.UserId, n.IsRead, n.CreatedAt })
            .HasDatabaseName("ix_notifications_user_read_created");

        builder.HasIndex(n => new { n.CompanyId, n.Type })
            .HasDatabaseName("ix_notifications_company_type");

        builder.HasIndex(n => new { n.EntityType, n.EntityId })
            .HasDatabaseName("ix_notifications_entity");

        builder.HasIndex(n => n.ExpiresAt)
            .HasDatabaseName("ix_notifications_expires");

        // Foreign Keys
        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

