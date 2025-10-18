using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Gider kategorisi
/// </summary>
public class ExpenseCategory : TenantEntity, IAuditableEntity, ISoftDeletable
{
    /// <summary>Kategori kodu</summary>
    public string Code { get; set; } = string.Empty;
    
    /// <summary>Kategori adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Üst kategori ID (hiyerarşik yapı için)</summary>
    public Guid? ParentCategoryId { get; set; }
    
    /// <summary>Bütçe limiti (aylık)</summary>
    public decimal? MonthlyBudget { get; set; }
    
    /// <summary>Para birimi</summary>
    public string Currency { get; set; } = "TRY";
    
    /// <summary>Renk kodu (UI için)</summary>
    public string? ColorCode { get; set; }
    
    /// <summary>Aktif mi?</summary>
    public bool IsActive { get; set; } = true;
    
    /// <summary>Sıralama</summary>
    public int DisplayOrder { get; set; }
    
    // Navigation Properties
    public virtual ExpenseCategory? ParentCategory { get; set; }
    public virtual ICollection<ExpenseCategory> SubCategories { get; set; } = new List<ExpenseCategory>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    
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

