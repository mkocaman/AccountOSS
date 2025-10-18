using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.ToTable("api_keys");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(a => a.KeyHash)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("key_hash");

        builder.Property(a => a.KeyPrefix)
            .IsRequired()
            .HasMaxLength(20)
            .HasColumnName("key_prefix");

        builder.Property(a => a.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        builder.Property(a => a.Permissions)
            .HasColumnName("permissions")
            .HasColumnType("jsonb");

        builder.Property(a => a.RateLimitPerMinute)
            .IsRequired()
            .HasColumnName("rate_limit_per_minute");

        builder.Property(a => a.LastUsedAt)
            .HasColumnName("last_used_at");

        builder.Property(a => a.UsageCount)
            .IsRequired()
            .HasColumnName("usage_count");

        builder.Property(a => a.ExpiresAt)
            .HasColumnName("expires_at");

        builder.Property(a => a.AllowedIps)
            .HasColumnName("allowed_ips")
            .HasColumnType("jsonb");

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        // Audit fields
        builder.Property(a => a.CreatedAt).HasColumnName("created_at");
        builder.Property(a => a.CreatedBy).HasColumnName("created_by");
        builder.Property(a => a.UpdatedAt).HasColumnName("updated_at");
        builder.Property(a => a.UpdatedBy).HasColumnName("updated_by");
        builder.Property(a => a.IsDeleted).HasColumnName("is_deleted");
        builder.Property(a => a.DeletedAt).HasColumnName("deleted_at");
        builder.Property(a => a.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(a => new { a.CompanyId, a.IsActive })
            .HasDatabaseName("ix_api_keys_company_active");

        builder.HasIndex(a => a.KeyPrefix)
            .HasDatabaseName("ix_api_keys_prefix");

        builder.HasIndex(a => a.ExpiresAt)
            .HasDatabaseName("ix_api_keys_expires");
    }
}

