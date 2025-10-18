using AccountOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AccountOS.Infrastructure.Persistence.Configurations;

/// <summary>
/// Customer entity konfigürasyonu
/// </summary>
public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("customers");

        builder.HasKey(c => c.Id);

        // Tenant Entity
        builder.Property(c => c.CompanyId)
            .IsRequired()
            .HasColumnName("company_id");

        builder.Property(c => c.Code)
            .IsRequired()
            .HasMaxLength(50)
            .HasColumnName("code");

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(200)
            .HasColumnName("name");

        builder.Property(c => c.Type)
            .IsRequired()
            .HasConversion<int>()
            .HasColumnName("type");

        // İletişim
        builder.Property(c => c.Email)
            .HasMaxLength(200)
            .HasColumnName("email");

        builder.Property(c => c.Phone)
            .HasMaxLength(50)
            .HasColumnName("phone");

        builder.Property(c => c.MobilePhone)
            .HasMaxLength(50)
            .HasColumnName("mobile_phone");

        builder.Property(c => c.Website)
            .HasMaxLength(200)
            .HasColumnName("website");

        // Vergi
        builder.Property(c => c.TaxNumber)
            .HasMaxLength(50)
            .HasColumnName("tax_number");

        builder.Property(c => c.TaxOffice)
            .HasMaxLength(200)
            .HasColumnName("tax_office");

        builder.Property(c => c.IdentityNumber)
            .HasMaxLength(20)
            .HasColumnName("identity_number");

        // Adres
        builder.Property(c => c.BillingAddress)
            .HasMaxLength(500)
            .HasColumnName("billing_address");

        builder.Property(c => c.ShippingAddress)
            .HasMaxLength(500)
            .HasColumnName("shipping_address");

        builder.Property(c => c.City)
            .HasMaxLength(100)
            .HasColumnName("city");

        builder.Property(c => c.Country)
            .HasMaxLength(100)
            .HasColumnName("country");

        builder.Property(c => c.PostalCode)
            .HasMaxLength(20)
            .HasColumnName("postal_code");

        // Finansal
        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(3)
            .HasColumnName("currency");

        builder.Property(c => c.CreditLimit)
            .HasPrecision(18, 2)
            .HasColumnName("credit_limit");

        builder.Property(c => c.PaymentTermDays)
            .HasColumnName("payment_term_days");

        builder.Property(c => c.CurrentBalance)
            .HasPrecision(18, 2)
            .HasColumnName("current_balance");

        // Durum
        builder.Property(c => c.IsActive)
            .HasColumnName("is_active");

        builder.Property(c => c.IsBlocked)
            .HasColumnName("is_blocked");

        builder.Property(c => c.BlockReason)
            .HasMaxLength(500)
            .HasColumnName("block_reason");

        builder.Property(c => c.Notes)
            .HasColumnType("text")
            .HasColumnName("notes");

        // Audit fields (TenantEntity'den geliyor)
        builder.Property(c => c.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(c => c.CreatedBy)
            .HasColumnName("created_by");

        builder.Property(c => c.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(c => c.UpdatedBy)
            .HasColumnName("updated_by");

        builder.Property(c => c.IsDeleted)
            .HasColumnName("is_deleted");

        builder.Property(c => c.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(c => c.DeletedBy)
            .HasColumnName("deleted_by");

        // Indexes
        builder.HasIndex(c => new { c.CompanyId, c.Code })
            .IsUnique()
            .HasDatabaseName("ix_customers_company_code");

        builder.HasIndex(c => new { c.CompanyId, c.Name })
            .HasDatabaseName("ix_customers_company_name");

        builder.HasIndex(c => c.Email)
            .HasDatabaseName("ix_customers_email");

        builder.HasIndex(c => c.TaxNumber)
            .HasDatabaseName("ix_customers_tax_number");

        // Foreign Key
        builder.HasOne<Company>()
            .WithMany()
            .HasForeignKey(c => c.CompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

