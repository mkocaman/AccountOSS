using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("notification_preferences");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(p => p.UserId)
            .IsRequired()
            .HasColumnName("user_id");

        builder.Property(p => p.NotificationType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("notification_type");

        builder.Property(p => p.InAppEnabled)
            .IsRequired()
            .HasColumnName("in_app_enabled");

        builder.Property(p => p.EmailEnabled)
            .IsRequired()
            .HasColumnName("email_enabled");

        builder.Property(p => p.SmsEnabled)
            .IsRequired()
            .HasColumnName("sms_enabled");

        builder.Property(p => p.PushEnabled)
            .IsRequired()
            .HasColumnName("push_enabled");

        builder.Property(p => p.MinimumPriority)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("minimum_priority");

        builder.Property(p => p.QuietHoursStart)
            .HasMaxLength(5)
            .HasColumnName("quiet_hours_start");

        builder.Property(p => p.QuietHoursEnd)
            .HasMaxLength(5)
            .HasColumnName("quiet_hours_end");

        // Audit fields
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.CreatedBy).HasColumnName("created_by");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedBy).HasColumnName("updated_by");
        builder.Property(p => p.IsDeleted).HasColumnName("is_deleted");
        builder.Property(p => p.DeletedAt).HasColumnName("deleted_at");
        builder.Property(p => p.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(p => new { p.UserId, p.NotificationType })
            .IsUnique()
            .HasDatabaseName("ix_notification_preferences_user_type");

        // Foreign Keys
        builder.HasOne(p => p.User)
            .WithMany()
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

