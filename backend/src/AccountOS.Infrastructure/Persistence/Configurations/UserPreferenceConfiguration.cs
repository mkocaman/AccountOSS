using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class UserPreferenceConfiguration : IEntityTypeConfiguration<UserPreference>
{
    public void Configure(EntityTypeBuilder<UserPreference> builder)
    {
        builder.ToTable("user_preferences");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.UserId)
            .IsRequired()
            .HasColumnName("user_id");

        builder.Property(p => p.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        // UI Preferences
        builder.Property(p => p.Theme)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("theme");

        builder.Property(p => p.Language)
            .IsRequired()
            .HasMaxLength(10)
            .HasColumnName("language");

        builder.Property(p => p.Timezone)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("timezone");

        builder.Property(p => p.DateFormat)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("date_format");

        builder.Property(p => p.TimeFormat)
            .IsRequired()
            .HasMaxLength(10)
            .HasColumnName("time_format");

        builder.Property(p => p.NumberFormat)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("number_format");

        builder.Property(p => p.DefaultCurrency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("default_currency");

        // Dashboard Preferences
        builder.Property(p => p.DashboardLayout)
            .HasColumnName("dashboard_layout")
            .HasColumnType("jsonb");

        builder.Property(p => p.DefaultPage)
            .HasMaxLength(200)
            .HasColumnName("default_page");

        builder.Property(p => p.ItemsPerPage)
            .IsRequired()
            .HasColumnName("items_per_page");

        builder.Property(p => p.CompactMode)
            .IsRequired()
            .HasColumnName("compact_mode");

        builder.Property(p => p.SidebarCollapsed)
            .IsRequired()
            .HasColumnName("sidebar_collapsed");

        // Email Preferences
        builder.Property(p => p.EmailNotificationsEnabled)
            .IsRequired()
            .HasColumnName("email_notifications_enabled");

        builder.Property(p => p.DailyDigestEmail)
            .IsRequired()
            .HasColumnName("daily_digest_email");

        builder.Property(p => p.WeeklyReportEmail)
            .IsRequired()
            .HasColumnName("weekly_report_email");

        // Default Values
        builder.Property(p => p.DefaultInvoiceDueDays)
            .HasColumnName("default_invoice_due_days");

        builder.Property(p => p.DefaultPaymentMethod)
            .HasConversion<int?>()
            .HasColumnName("default_payment_method");

        builder.Property(p => p.DefaultVatRate)
            .HasColumnName("default_vat_rate")
            .HasColumnType("decimal(5,2)");

        builder.Property(p => p.InvoiceNotesTemplate)
            .HasMaxLength(2000)
            .HasColumnName("invoice_notes_template");

        // Privacy Settings
        builder.Property(p => p.ProfileVisibility)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("profile_visibility");

        builder.Property(p => p.ShowLastActivity)
            .IsRequired()
            .HasColumnName("show_last_activity");

        builder.Property(p => p.ShowEmail)
            .IsRequired()
            .HasColumnName("show_email");

        // Advanced Preferences
        builder.Property(p => p.KeyboardShortcuts)
            .HasColumnName("keyboard_shortcuts")
            .HasColumnType("jsonb");

        builder.Property(p => p.CustomCss)
            .HasMaxLength(5000)
            .HasColumnName("custom_css");

        builder.Property(p => p.AdditionalSettings)
            .HasColumnName("additional_settings")
            .HasColumnType("jsonb");

        // Audit fields
        builder.Property(p => p.CreatedAt).HasColumnName("created_at");
        builder.Property(p => p.CreatedBy).HasColumnName("created_by");
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at");
        builder.Property(p => p.UpdatedBy).HasColumnName("updated_by");

        // Indexes
        builder.HasIndex(p => p.UserId)
            .IsUnique()
            .HasDatabaseName("ix_user_preferences_user");

        builder.HasIndex(p => new { p.CompanyId, p.Language })
            .HasDatabaseName("ix_user_preferences_company_language");

        // Foreign Keys
        builder.HasOne(p => p.User)
            .WithOne()
            .HasForeignKey<UserPreference>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.Company)
            .WithMany()
            .HasForeignKey(p => p.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

