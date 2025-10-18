using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Translation entity konfigürasyonu
/// </summary>
public class TranslationConfiguration : IEntityTypeConfiguration<Translation>
{
    public void Configure(EntityTypeBuilder<Translation> builder)
    {
        builder.ToTable("translations");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageId)
            .IsRequired()
            .HasColumnName("language_id");

        builder.Property(t => t.Key)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("key");

        builder.Property(t => t.Value)
            .IsRequired()
            .HasMaxLength(1000)
            .HasColumnName("value");

        builder.Property(t => t.Category)
            .HasMaxLength(50)
            .HasColumnName("category");

        builder.Property(t => t.Description)
            .HasMaxLength(500)
            .HasColumnName("description");

        // Unique constraint: LanguageId + Key
        builder.HasIndex(t => new { t.LanguageId, t.Key })
            .IsUnique()
            .HasDatabaseName("ix_translations_language_key");

        // Index for fast category lookup
        builder.HasIndex(t => t.Category)
            .HasDatabaseName("ix_translations_category");
    }
}

