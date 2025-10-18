using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Gider entity
/// </summary>
public class Expense : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Gider numarası (otomatik: EXP-2025-0001)</summary>
    public string ExpenseNumber { get; set; } = string.Empty;
    
    /// <summary>Gider kategorisi ID</summary>
    public Guid CategoryId { get; set; }
    
    /// <summary>Tedarikçi/Satıcı ID (opsiyonel - Customer entity kullanılıyor)</summary>
    public Guid? SupplierId { get; set; }
    
    /// <summary>Gider tarihi</summary>
    public DateTime ExpenseDate { get; set; }
    
    /// <summary>Ödeme tarihi (fiili ödeme tarihi)</summary>
    public DateTime? PaymentDate { get; set; }
    
    /// <summary>Gider başlığı</summary>
    public string Title { get; set; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Tutar</summary>
    public decimal Amount { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Kullanılan kur (snapshot)</summary>
    public decimal ExchangeRate { get; set; } = 1m;
    
    /// <summary>Baz para birimi</summary>
    public string BaseCurrency { get; set; } = "TRY";
    
    /// <summary>Baz para biriminde tutar</summary>
    public decimal AmountInBase { get; set; }
    
    /// <summary>KDV tutarı</summary>
    public decimal VatAmount { get; set; }
    
    /// <summary>KDV oranı (%)</summary>
    public decimal VatRate { get; set; }
    
    /// <summary>Ödeme yöntemi</summary>
    public ExpensePaymentMethod PaymentMethod { get; set; }
    
    /// <summary>Durum</summary>
    public ExpenseStatus Status { get; set; }
    
    /// <summary>Onay durumu</summary>
    public ExpenseApprovalStatus ApprovalStatus { get; set; }
    
    /// <summary>Onaylayan kullanıcı ID</summary>
    public Guid? ApprovedBy { get; set; }
    
    /// <summary>Onay tarihi</summary>
    public DateTime? ApprovedAt { get; set; }
    
    /// <summary>Red nedeni</summary>
    public string? RejectionReason { get; set; }
    
    /// <summary>Fatura/Fiş numarası</summary>
    public string? InvoiceNumber { get; set; }
    
    /// <summary>Referans numarası</summary>
    public string? ReferenceNumber { get; set; }
    
    /// <summary>Tekrarlayan gider mi?</summary>
    public bool IsRecurring { get; set; }
    
    /// <summary>Tekrarlama sıklığı</summary>
    public RecurringFrequency? RecurringFrequency { get; set; }
    
    /// <summary>Tekrarlama bitiş tarihi</summary>
    public DateTime? RecurringEndDate { get; set; }
    
    /// <summary>İlgili proje/iş ID (future: project module)</summary>
    public Guid? ProjectId { get; set; }
    
    /// <summary>Dosya ekleri (JSON array - file IDs)</summary>
    public string? AttachmentIds { get; set; }
    
    /// <summary>Notlar</summary>
    public string? Notes { get; set; }
    
    /// <summary>Etiketler (JSON array)</summary>
    public string? Tags { get; set; }
    
    // Navigation Properties
    public virtual ExpenseCategory Category { get; set; } = null!;
    public virtual Customer? Supplier { get; set; }
    public virtual User? Approver { get; set; }
    
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

