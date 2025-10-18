using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class FileStorageConfigurationConfiguration : IEntityTypeConfiguration<FileStorageConfiguration>
{
    public void Configure(EntityTypeBuilder<FileStorageConfiguration> builder)
    {
        builder.ToTable("file_storage_configurations");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Provider)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(c => c.Configuration)
            .IsRequired()
            .HasColumnType("jsonb");

        builder.Property(c => c.IsActive).IsRequired();
        builder.Property(c => c.IsDefault).IsRequired();
        builder.Property(c => c.StorageQuotaMb).IsRequired();
        builder.Property(c => c.UsedStorageMb).IsRequired();
        builder.Property(c => c.MaxFileSizeMb).IsRequired();
        
        builder.Property(c => c.AllowedFileTypes)
            .HasColumnType("jsonb");

        builder.Property(c => c.IsTested).IsRequired();
        builder.Property(c => c.LastTestedAt);

        // Audit fields
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.CreatedBy).IsRequired();
        builder.Property(c => c.UpdatedAt);
        builder.Property(c => c.UpdatedBy);
        builder.Property(c => c.IsDeleted).HasDefaultValue(false);
        builder.Property(c => c.DeletedAt);
        builder.Property(c => c.DeletedBy);
        builder.Property(c => c.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(c => new { c.CompanyId, c.Provider })
            .HasDatabaseName("IX_file_storage_configs_company_provider");

        builder.HasIndex(c => new { c.CompanyId, c.IsActive, c.IsDefault })
            .HasDatabaseName("IX_file_storage_configs_company_active_default");
    }
}

