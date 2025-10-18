using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class RateLimitRuleConfiguration : IEntityTypeConfiguration<RateLimitRule>
{
    public void Configure(EntityTypeBuilder<RateLimitRule> builder)
    {
        builder.ToTable("rate_limit_rules");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(r => r.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(r => r.EndpointPattern)
            .IsRequired()
            .HasMaxLength(500)
            .HasColumnName("endpoint_pattern");

        builder.Property(r => r.HttpMethod)
            .HasMaxLength(10)
            .HasColumnName("http_method");

        builder.Property(r => r.LimitType)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("limit_type");

        builder.Property(r => r.RequestLimit)
            .IsRequired()
            .HasColumnName("request_limit");

        builder.Property(r => r.TimeWindowSeconds)
            .IsRequired()
            .HasColumnName("time_window_seconds");

        builder.Property(r => r.Priority)
            .IsRequired()
            .HasColumnName("priority");

        builder.Property(r => r.IsActive)
            .IsRequired()
            .HasColumnName("is_active");

        builder.Property(r => r.WhitelistedIps)
            .HasColumnName("whitelisted_ips")
            .HasColumnType("jsonb");

        builder.Property(r => r.Description)
            .HasMaxLength(1000)
            .HasColumnName("description");

        // Audit fields
        builder.Property(r => r.CreatedAt).HasColumnName("created_at");
        builder.Property(r => r.CreatedBy).HasColumnName("created_by");
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at");
        builder.Property(r => r.UpdatedBy).HasColumnName("updated_by");
        builder.Property(r => r.IsDeleted).HasColumnName("is_deleted");
        builder.Property(r => r.DeletedAt).HasColumnName("deleted_at");
        builder.Property(r => r.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(r => new { r.CompanyId, r.IsActive, r.Priority })
            .HasDatabaseName("ix_rate_limit_rules_company_active_priority");

        builder.HasIndex(r => r.EndpointPattern)
            .HasDatabaseName("ix_rate_limit_rules_endpoint");
    }
}

