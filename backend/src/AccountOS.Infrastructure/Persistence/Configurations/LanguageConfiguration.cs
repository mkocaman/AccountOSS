using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Language entity konfigürasyonu
/// </summary>
public class LanguageConfiguration : IEntityTypeConfiguration<Language>
{
    public void Configure(EntityTypeBuilder<Language> builder)
    {
        builder.ToTable("languages");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Code)
            .IsRequired()
            .HasMaxLength(2)
            .HasColumnName("code");

        builder.Property(l => l.Name)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("name");

        builder.Property(l => l.NativeName)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("native_name");

        builder.Property(l => l.FlagIcon)
            .HasMaxLength(10)
            .HasColumnName("flag_icon");

        builder.Property(l => l.IsRtl)
            .HasColumnName("is_rtl");

        builder.Property(l => l.IsActive)
            .HasColumnName("is_active");

        builder.Property(l => l.IsDefault)
            .HasColumnName("is_default");

        builder.Property(l => l.DisplayOrder)
            .HasColumnName("display_order");

        // Unique constraint on Code
        builder.HasIndex(l => l.Code)
            .IsUnique()
            .HasDatabaseName("ix_languages_code");

        // Navigation
        builder.HasMany(l => l.Translations)
            .WithOne(t => t.Language)
            .HasForeignKey(t => t.LanguageId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

