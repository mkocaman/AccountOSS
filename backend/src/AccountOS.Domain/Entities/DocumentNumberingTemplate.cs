using AccountOS.Domain.Common;
using AccountOS.Domain.Enums;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Evrak numaralandırma şablonu
/// </summary>
public class DocumentNumberingTemplate : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Evrak tipi (Invoice, Payment, Quote, Order, vb.)</summary>
    public string DocumentType { get; set; } = string.Empty;
    
    /// <summary>Alt tip (SalesInvoice, PurchaseInvoice, vb.)</summary>
    public string? SubType { get; set; }
    
    /// <summary>Şablon formatı (örn: {PREFIX}-{YEAR}-{SEQUENCE})</summary>
    public string Template { get; set; } = string.Empty;
    
    /// <summary>Prefix (örn: INV, VME, FAT)</summary>
    public string Prefix { get; set; } = string.Empty;
    
    /// <summary>Yıl dahil mi?</summary>
    public bool IncludeYear { get; set; }
    
    /// <summary>Yıl formatı (YYYY veya YY)</summary>
    public string YearFormat { get; set; } = "YYYY";
    
    /// <summary>Ay dahil mi?</summary>
    public bool IncludeMonth { get; set; }
    
    /// <summary>Ay formatı (MM veya M)</summary>
    public string MonthFormat { get; set; } = "MM";
    
    /// <summary>Sıra numarası uzunluğu (padding)</summary>
    public int SequenceLength { get; set; }
    
    /// <summary>Başlangıç numarası</summary>
    public int StartingNumber { get; set; }
    
    /// <summary>Mevcut sıra numarası</summary>
    public int CurrentSequence { get; set; }
    
    /// <summary>Reset sıklığı</summary>
    public ResetFrequency ResetFrequency { get; set; }
    
    /// <summary>Son reset tarihi</summary>
    public DateTime? LastResetDate { get; set; }
    
    /// <summary>Örnek çıktı</summary>
    public string ExampleOutput { get; set; } = string.Empty;
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
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

