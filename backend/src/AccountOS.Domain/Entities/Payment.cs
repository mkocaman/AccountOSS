using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Ödeme entity
/// </summary>
public class Payment : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Ödeme numarası (otomatik: PAY-2025-0001)</summary>
    public string PaymentNumber { get; set; } = string.Empty;
    
    /// <summary>Ödeme tipi (Receipt/Payment)</summary>
    public PaymentType Type { get; set; }
    
    /// <summary>Cari hesap ID</summary>
    public Guid CustomerId { get; set; }
    
    /// <summary>Fatura ID (opsiyonel - direkt faturaya bağlı ödeme)</summary>
    public Guid? InvoiceId { get; set; }
    
    /// <summary>Ödeme tarihi</summary>
    public DateTime PaymentDate { get; set; }
    
    /// <summary>Ödeme yöntemi</summary>
    public PaymentMethod Method { get; set; }
    
    /// <summary>Ödeme tutarı</summary>
    public decimal Amount { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = string.Empty;
    
    /// <summary>Kullanılan kur (snapshot)</summary>
    public decimal ExchangeRate { get; set; }
    
    /// <summary>Baz para birimi</summary>
    public string BaseCurrency { get; set; } = string.Empty;
    
    /// <summary>Baz para biriminde tutar</summary>
    public decimal AmountInBase { get; set; }
    
    /// <summary>Banka hesap bilgisi (opsiyonel)</summary>
    public string? BankAccount { get; set; }
    
    /// <summary>Referans no (dekont no, çek no, vb.)</summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    // Navigation Properties
    /// <summary>Cari hesap</summary>
    public virtual Customer Customer { get; set; } = null!;
    
    /// <summary>İlgili fatura (opsiyonel)</summary>
    public virtual Invoice? Invoice { get; set; }
    
    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedBy { get; set; }
    
    // ISoftDeletable
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public Guid? DeletedBy { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
}

