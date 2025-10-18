using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class FileAttachmentConfiguration : IEntityTypeConfiguration<FileAttachment>
{
    public void Configure(EntityTypeBuilder<FileAttachment> builder)
    {
        builder.ToTable("file_attachments");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.FileId).IsRequired();
        builder.Property(a => a.EntityType).IsRequired().HasMaxLength(100);
        builder.Property(a => a.EntityId).IsRequired();
        builder.Property(a => a.Description).HasMaxLength(1000);
        builder.Property(a => a.DisplayOrder).IsRequired();
        builder.Property(a => a.IsRequired).IsRequired();

        // Audit fields
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.CreatedBy).IsRequired();
        builder.Property(a => a.UpdatedAt);
        builder.Property(a => a.UpdatedBy);
        builder.Property(a => a.IsDeleted).HasDefaultValue(false);
        builder.Property(a => a.DeletedAt);
        builder.Property(a => a.DeletedBy);
        builder.Property(a => a.RowVersion).IsRowVersion();

        // Indexes
        builder.HasIndex(a => new { a.CompanyId, a.EntityType, a.EntityId })
            .HasDatabaseName("IX_file_attachments_company_entity");

        builder.HasIndex(a => new { a.FileId, a.EntityId })
            .HasDatabaseName("IX_file_attachments_file_entity");

        // Relationships
        builder.HasOne(a => a.File)
            .WithMany(f => f.Attachments)
            .HasForeignKey(a => a.FileId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

