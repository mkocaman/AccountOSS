using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

public class CompanySettingsConfiguration : IEntityTypeConfiguration<CompanySettings>
{
    public void Configure(EntityTypeBuilder<CompanySettings> builder)
    {
        builder.ToTable("company_settings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        // Company Info
        builder.Property(s => s.CompanyName)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("company_name");

        builder.Property(s => s.LogoUrl)
            .HasMaxLength(500)
            .HasColumnName("logo_url");

        builder.Property(s => s.Website)
            .HasMaxLength(500)
            .HasColumnName("website");

        builder.Property(s => s.Phone)
            .HasMaxLength(50)
            .HasColumnName("phone");

        builder.Property(s => s.Email)
            .HasMaxLength(200)
            .HasColumnName("email");

        builder.Property(s => s.Address)
            .HasMaxLength(1000)
            .HasColumnName("address");

        builder.Property(s => s.TaxNumber)
            .HasMaxLength(50)
            .HasColumnName("tax_number");

        builder.Property(s => s.TaxOffice)
            .HasMaxLength(200)
            .HasColumnName("tax_office");

        // Default Settings
        builder.Property(s => s.DefaultCurrency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("default_currency");

        builder.Property(s => s.DefaultLanguage)
            .IsRequired()
            .HasMaxLength(10)
            .HasColumnName("default_language");

        builder.Property(s => s.DefaultTimezone)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("default_timezone");

        builder.Property(s => s.DefaultVatRate)
            .IsRequired()
            .HasColumnName("default_vat_rate")
            .HasColumnType("decimal(5,2)");

        builder.Property(s => s.DefaultInvoiceDueDays)
            .IsRequired()
            .HasColumnName("default_invoice_due_days");

        builder.Property(s => s.DefaultPaymentMethod)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("default_payment_method");

        // Invoice Settings
        builder.Property(s => s.InvoicePrefix)
            .HasMaxLength(20)
            .HasColumnName("invoice_prefix");

        builder.Property(s => s.InvoiceStartNumber)
            .IsRequired()
            .HasColumnName("invoice_start_number");

        builder.Property(s => s.InvoiceNumberFormat)
            .IsRequired()
            .HasMaxLength(100)
            .HasColumnName("invoice_number_format");

        builder.Property(s => s.InvoiceFooter)
            .HasMaxLength(2000)
            .HasColumnName("invoice_footer");

        builder.Property(s => s.DefaultInvoiceNotes)
            .HasMaxLength(2000)
            .HasColumnName("default_invoice_notes");

        builder.Property(s => s.DefaultInvoiceTerms)
            .HasMaxLength(2000)
            .HasColumnName("default_invoice_terms");

        // Email Settings
        builder.Property(s => s.EmailSenderName)
            .HasMaxLength(200)
            .HasColumnName("email_sender_name");

        builder.Property(s => s.EmailSenderAddress)
            .HasMaxLength(200)
            .HasColumnName("email_sender_address");

        builder.Property(s => s.EmailSignature)
            .HasMaxLength(2000)
            .HasColumnName("email_signature");

        // Business Settings
        builder.Property(s => s.BusinessHoursStart)
            .IsRequired()
            .HasMaxLength(5)
            .HasColumnName("business_hours_start");

        builder.Property(s => s.BusinessHoursEnd)
            .IsRequired()
            .HasMaxLength(5)
            .HasColumnName("business_hours_end");

        builder.Property(s => s.WeekendDays)
            .HasMaxLength(50)
            .HasColumnName("weekend_days");

        builder.Property(s => s.FiscalYearStartMonth)
            .IsRequired()
            .HasColumnName("fiscal_year_start_month");

        // Feature Flags
        builder.Property(s => s.MultiCurrencyEnabled)
            .IsRequired()
            .HasColumnName("multi_currency_enabled");

        builder.Property(s => s.InventoryEnabled)
            .IsRequired()
            .HasColumnName("inventory_enabled");

        builder.Property(s => s.ExpenseManagementEnabled)
            .IsRequired()
            .HasColumnName("expense_management_enabled");

        builder.Property(s => s.RequireTwoFactor)
            .IsRequired()
            .HasColumnName("require_two_factor");

        builder.Property(s => s.RequireEmailVerification)
            .IsRequired()
            .HasColumnName("require_email_verification");

        // Additional Settings
        builder.Property(s => s.CustomSettings)
            .HasColumnName("custom_settings")
            .HasColumnType("jsonb");

        // Audit fields
        builder.Property(s => s.CreatedAt).HasColumnName("created_at");
        builder.Property(s => s.CreatedBy).HasColumnName("created_by");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");
        builder.Property(s => s.UpdatedBy).HasColumnName("updated_by");
        builder.Property(s => s.IsDeleted).HasColumnName("is_deleted");
        builder.Property(s => s.DeletedAt).HasColumnName("deleted_at");
        builder.Property(s => s.DeletedBy).HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(s => s.CompanyId)
            .IsUnique()
            .HasDatabaseName("ix_company_settings_company");
    }
}

