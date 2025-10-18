using AccountOS.Domain.Enums;

namespace AccountOS.Application.Customers.Common;

/// <summary>
/// Cari hesap DTO
/// </summary>
public record CustomerDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; init; }
    
    /// <summary>Cari hesap kodu</summary>
    public string Code { get; init; } = string.Empty;
    
    /// <summary>Cari hesap adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Tip (Bireysel/Kurumsal)</summary>
    public CustomerType Type { get; init; }
    
    /// <summary>Tip adı (görüntüleme için)</summary>
    public string TypeName { get; init; } = string.Empty;
    
    /// <summary>E-posta</summary>
    public string? Email { get; init; }
    
    /// <summary>Telefon</summary>
    public string? Phone { get; init; }
    
    /// <summary>Cep telefonu</summary>
    public string? MobilePhone { get; init; }
    
    /// <summary>Web sitesi</summary>
    public string? Website { get; init; }
    
    /// <summary>Vergi numarası</summary>
    public string? TaxNumber { get; init; }
    
    /// <summary>Vergi dairesi</summary>
    public string? TaxOffice { get; init; }
    
    /// <summary>TC Kimlik No</summary>
    public string? IdentityNumber { get; init; }
    
    /// <summary>Fatura adresi</summary>
    public string? BillingAddress { get; init; }
    
    /// <summary>Sevkiyat adresi</summary>
    public string? ShippingAddress { get; init; }
    
    /// <summary>Şehir</summary>
    public string? City { get; init; }
    
    /// <summary>Ülke</summary>
    public string? Country { get; init; }
    
    /// <summary>Posta kodu</summary>
    public string? PostalCode { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>Kredi limiti</summary>
    public decimal CreditLimit { get; init; }
    
    /// <summary>Vade gün sayısı</summary>
    public int PaymentTermDays { get; init; }
    
    /// <summary>Güncel bakiye</summary>
    public decimal CurrentBalance { get; init; }
    
    /// <summary>Bakiye durumu (Alacak/Borç)</summary>
    public string BalanceStatus { get; init; } = string.Empty;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; init; }
    
    /// <summary>Bloke mi?</summary>
    public bool IsBlocked { get; init; }
    
    /// <summary>Bloke nedeni</summary>
    public string? BlockReason { get; init; }
    
    /// <summary>Notlar</summary>
    public string? Notes { get; init; }
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
}

