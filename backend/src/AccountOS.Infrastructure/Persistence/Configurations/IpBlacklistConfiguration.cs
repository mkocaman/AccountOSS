using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class IpBlacklistConfiguration : IEntityTypeConfiguration<IpBlacklist>
{
    public void Configure(EntityTypeBuilder<IpBlacklist> builder)
    {
        builder.ToTable("ip_blacklist");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.IpAddress)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("ip_address");

        builder.Property(i => i.Reason)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("reason");

        builder.Property(i => i.BlockedAt)
            .IsRequired()
            .HasColumnName("blocked_at");

        builder.Property(i => i.BlockedUntil)
            .HasColumnName("blocked_until");

        builder.Property(i => i.IsAutoBlocked)
            .IsRequired()
            .HasColumnName("is_auto_blocked");

        builder.Property(i => i.FailedAttempts)
            .IsRequired()
            .HasColumnName("failed_attempts");

        builder.Property(i => i.LastActivityAt)
            .HasColumnName("last_activity_at");

        builder.Property(i => i.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        // Audit fields
        builder.Property(i => i.CreatedAt).HasColumnName("created_at");
        builder.Property(i => i.CreatedBy).HasColumnName("created_by");
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at");
        builder.Property(i => i.UpdatedBy).HasColumnName("updated_by");

        // Indexes
        builder.HasIndex(i => new { i.IpAddress, i.IsActive })
            .HasDatabaseName("ix_ip_blacklist_ip_active");

        builder.HasIndex(i => i.BlockedUntil)
            .HasDatabaseName("ix_ip_blacklist_blocked_until");
    }
}

