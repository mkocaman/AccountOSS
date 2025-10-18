using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Customers.Commands.CreateCustomer;

/// <summary>
/// Yeni cari hesap oluşturma komutu
/// </summary>
public record CreateCustomerCommand : IRequest<Result<CustomerDto>>
{
    /// <summary>Cari hesap adı/unvanı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Tip (Bireysel/Kurumsal)</summary>
    public CustomerType Type { get; init; }
    
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
    
    /// <summary>TC Kimlik No (bireysel için)</summary>
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
    
    /// <summary>Varsayılan para birimi</summary>
    public string Currency { get; init; } = "TRY";
    
    /// <summary>Kredi limiti</summary>
    public decimal CreditLimit { get; init; }
    
    /// <summary>Vade gün sayısı</summary>
    public int PaymentTermDays { get; init; } = 0;
    
    /// <summary>Notlar</summary>
    public string? Notes { get; init; }
}

