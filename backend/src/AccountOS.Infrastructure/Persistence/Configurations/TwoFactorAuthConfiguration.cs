using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class TwoFactorAuthConfiguration : IEntityTypeConfiguration<TwoFactorAuth>
{
    public void Configure(EntityTypeBuilder<TwoFactorAuth> builder)
    {
        builder.ToTable("two_factor_auth");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.UserId)
            .IsRequired()
            .HasColumnName("user_id");

        builder.Property(t => t.IsEnabled)
            .IsRequired()
            .HasColumnName("is_enabled");

        builder.Property(t => t.SecretKey)
            .HasMaxLength(500)
            .HasColumnName("secret_key");

        builder.Property(t => t.BackupCodes)
            .HasColumnName("backup_codes")
            .HasColumnType("jsonb");

        builder.Property(t => t.LastVerifiedAt)
            .HasColumnName("last_verified_at");

        builder.Property(t => t.TrustedDevices)
            .HasColumnName("trusted_devices")
            .HasColumnType("jsonb");

        builder.Property(t => t.FailedAttempts)
            .IsRequired()
            .HasColumnName("failed_attempts");

        builder.Property(t => t.LockedUntil)
            .HasColumnName("locked_until");

        // Audit fields
        builder.Property(t => t.CreatedAt).HasColumnName("created_at");
        builder.Property(t => t.CreatedBy).HasColumnName("created_by");
        builder.Property(t => t.UpdatedAt).HasColumnName("updated_at");
        builder.Property(t => t.UpdatedBy).HasColumnName("updated_by");

        // Indexes
        builder.HasIndex(t => t.UserId)
            .IsUnique()
            .HasDatabaseName("ix_two_factor_auth_user");

        // Foreign Keys
        builder.HasOne(t => t.User)
            .WithOne()
            .HasForeignKey<TwoFactorAuth>(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

