using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class FileConfiguration : IEntityTypeConfiguration<StoredFile>
{
    public void Configure(EntityTypeBuilder<StoredFile> builder)
    {
        builder.ToTable("files");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.FileName).IsRequired().HasMaxLength(500);
        builder.Property(f => f.FilePath).IsRequired().HasMaxLength(1000);
        builder.Property(f => f.FileSizeBytes).IsRequired();
        builder.Property(f => f.ContentType).IsRequired().HasMaxLength(200);
        builder.Property(f => f.FileExtension).IsRequired().HasMaxLength(50);
        
        builder.Property(f => f.StorageProvider)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(f => f.IsPublic).IsRequired();
        builder.Property(f => f.PublicUrl).HasMaxLength(2000);
        builder.Property(f => f.ThumbnailPath).HasMaxLength(1000);
        builder.Property(f => f.Description).HasMaxLength(2000);
        
        builder.Property(f => f.Tags).HasColumnType("jsonb");
        builder.Property(f => f.FileHash).HasMaxLength(100);
        
        builder.Property(f => f.DownloadCount).IsRequired();
        builder.Property(f => f.LastDownloadedAt);
        builder.Property(f => f.IsScanned).IsRequired();
        builder.Property(f => f.HasVirus).IsRequired();
        builder.Property(f => f.Version).IsRequired();
        builder.Property(f => f.ParentFileId);

        // Audit fields
        builder.Property(f => f.CreatedAt).IsRequired();
        builder.Property(f => f.CreatedBy).IsRequired();
        builder.Property(f => f.UpdatedAt);
        builder.Property(f => f.UpdatedBy);
        builder.Property(f => f.IsDeleted).HasDefaultValue(false);
        builder.Property(f => f.DeletedAt);
        builder.Property(f => f.DeletedBy);
        builder.Property(f => f.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(f => new { f.CompanyId, f.CreatedAt })
            .HasDatabaseName("IX_files_company_created");

        builder.HasIndex(f => new { f.CompanyId, f.FileExtension })
            .HasDatabaseName("IX_files_company_extension");

        builder.HasIndex(f => f.FileHash)
            .HasDatabaseName("IX_files_hash");

        builder.HasIndex(f => new { f.ParentFileId, f.Version })
            .HasDatabaseName("IX_files_parent_version");

        // Relationships
        builder.HasOne(f => f.ParentFile)
            .WithMany(f => f.Versions)
            .HasForeignKey(f => f.ParentFileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

