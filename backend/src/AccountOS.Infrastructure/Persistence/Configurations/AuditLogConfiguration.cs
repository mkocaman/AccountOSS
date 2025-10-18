using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(a => a.Id);

        // Properties
        builder.Property(a => a.CompanyId);

        builder.Property(a => a.UserId)
            .IsRequired();

        builder.Property(a => a.UserName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.UserEmail)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntityId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntityName)
            .HasMaxLength(500);

        builder.Property(a => a.OldValues)
            .HasColumnType("jsonb"); // PostgreSQL

        builder.Property(a => a.NewValues)
            .HasColumnType("jsonb"); // PostgreSQL

        builder.Property(a => a.ChangedProperties)
            .HasColumnType("jsonb"); // PostgreSQL

        builder.Property(a => a.Description)
            .HasMaxLength(1000);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(50);

        builder.Property(a => a.UserAgent)
            .HasMaxLength(500);

        builder.Property(a => a.Timestamp)
            .IsRequired();

        builder.Property(a => a.HttpMethod)
            .HasMaxLength(10);

        builder.Property(a => a.RequestPath)
            .HasMaxLength(500);

        builder.Property(a => a.StatusCode);

        builder.Property(a => a.Duration);

        builder.Property(a => a.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(a => a.StackTrace);

        // Indexes for performance
        builder.HasIndex(a => new { a.CompanyId, a.Timestamp })
            .HasDatabaseName("IX_audit_logs_company_timestamp");

        builder.HasIndex(a => new { a.EntityType, a.EntityId })
            .HasDatabaseName("IX_audit_logs_entity");

        builder.HasIndex(a => new { a.UserId, a.Timestamp })
            .HasDatabaseName("IX_audit_logs_user_timestamp");

        builder.HasIndex(a => a.Action)
            .HasDatabaseName("IX_audit_logs_action");

        builder.HasIndex(a => a.IpAddress)
            .HasDatabaseName("IX_audit_logs_ip");

        // Foreign Keys
        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Company)
            .WithMany()
            .HasForeignKey(a => a.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

