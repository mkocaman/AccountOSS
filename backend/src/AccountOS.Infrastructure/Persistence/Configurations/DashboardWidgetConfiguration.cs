using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class DashboardWidgetConfiguration : IEntityTypeConfiguration<DashboardWidget>
{
    public void Configure(EntityTypeBuilder<DashboardWidget> builder)
    {
        builder.ToTable("dashboard_widgets");

        builder.HasKey(w => w.Id);

        builder.Property(w => w.UserId)
            .IsRequired()
            .HasColumnName("user_id");

        builder.Property(w => w.WidgetType)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("widget_type");

        builder.Property(w => w.Title)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("title");

        builder.Property(w => w.Settings)
            .HasColumnName("settings")
            .HasColumnType("jsonb");

        builder.Property(w => w.PositionX)
            .IsRequired()
            .HasColumnName("position_x");

        builder.Property(w => w.PositionY)
            .IsRequired()
            .HasColumnName("position_y");

        builder.Property(w => w.Width)
            .IsRequired()
            .HasColumnName("width");

        builder.Property(w => w.Height)
            .IsRequired()
            .HasColumnName("height");

        builder.Property(w => w.IsVisible)
            .IsRequired()
            .HasColumnName("is_visible");

        builder.Property(w => w.Order)
            .IsRequired()
            .HasColumnName("order");

        // Audit fields
        builder.Property(w => w.CreatedAt).HasColumnName("created_at");
        builder.Property(w => w.CreatedBy).HasColumnName("created_by");
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at");
        builder.Property(w => w.UpdatedBy).HasColumnName("updated_by");

        // Indexes
        builder.HasIndex(w => new { w.UserId, w.Order })
            .HasDatabaseName("ix_dashboard_widgets_user_order");

        builder.HasIndex(w => new { w.UserId, w.IsVisible })
            .HasDatabaseName("ix_dashboard_widgets_user_visible");

        // Foreign Keys
        builder.HasOne(w => w.User)
            .WithMany()
            .HasForeignKey(w => w.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

