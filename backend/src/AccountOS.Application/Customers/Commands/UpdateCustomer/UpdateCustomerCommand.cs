using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Customers.Commands.UpdateCustomer;

/// <summary>
/// Cari hesap güncelleme komutu
/// </summary>
public record UpdateCustomerCommand : IRequest<Result<CustomerDto>>
{
    /// <summary>Cari hesap ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Cari hesap adı</summary>
    public string Name { get; init; } = string.Empty;
    
    /// <summary>Tip</summary>
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
    public string? Currency { get; init; }
    
    /// <summary>Kredi limiti</summary>
    public decimal CreditLimit { get; init; }
    
    /// <summary>Vade gün sayısı</summary>
    public int PaymentTermDays { get; init; }
    
    /// <summary>Notlar</summary>
    public string? Notes { get; init; }
}

