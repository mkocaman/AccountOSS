using AccountOS.Domain.Enums;

namespace AccountOS.Application.Payments.Common;

/// <summary>
/// Ödeme DTO
/// </summary>
public record PaymentDto
{
    /// <summary>ID</summary>
    public Guid Id { get; init; }
    
    /// <summary>Şirket ID</summary>
    public Guid CompanyId { get; init; }
    
    /// <summary>Ödeme numarası</summary>
    public string PaymentNumber { get; init; } = string.Empty;
    
    /// <summary>Ödeme tipi</summary>
    public PaymentType Type { get; init; }
    
    /// <summary>Ödeme tipi adı</summary>
    public string TypeName { get; init; } = string.Empty;
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; init; }
    
    /// <summary>Cari hesap adı</summary>
    public string CustomerName { get; init; } = string.Empty;
    
    /// <summary>Cari hesap kodu</summary>
    public string CustomerCode { get; init; } = string.Empty;
    
    /// <summary>Fatura ID</summary>
    public Guid? InvoiceId { get; init; }
    
    /// <summary>Fatura numarası</summary>
    public string? InvoiceNumber { get; init; }
    
    /// <summary>Ödeme tarihi</summary>
    public DateTime PaymentDate { get; init; }
    
    /// <summary>Ödeme yöntemi</summary>
    public PaymentMethod Method { get; init; }
    
    /// <summary>Ödeme yöntemi adı</summary>
    public string MethodName { get; init; } = string.Empty;
    
    /// <summary>Tutar</summary>
    public decimal Amount { get; init; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; init; } = string.Empty;
    
    /// <summary>Kur</summary>
    public decimal ExchangeRate { get; init; }
    
    /// <summary>Baz para birimi</summary>
    public string BaseCurrency { get; init; } = string.Empty;
    
    /// <summary>Baz para biriminde tutar</summary>
    public decimal AmountInBase { get; init; }
    
    /// <summary>Banka hesabı</summary>
    public string? BankAccount { get; init; }
    
    /// <summary>Referans no</summary>
    public string? ReferenceNumber { get; init; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; init; }
    
    /// <summary>Oluşturulma tarihi</summary>
    public DateTime CreatedAt { get; init; }
}

