using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Çeviri entity (key-value pairs)
/// </summary>
public class Translation : BaseEntity
{
    /// <summary>Dil ID</summary>
    public Guid LanguageId { get; set; }
    
    /// <summary>Çeviri anahtarı (örn: invoice.create.title)</summary>
    public string Key { get; set; } = string.Empty;
    
    /// <summary>Çevrilmiş değer (örn: Fatura Oluştur)</summary>
    public string Value { get; set; } = string.Empty;
    
    /// <summary>Kategori (invoice, product, common, vb.)</summary>
    public string? Category { get; set; }
    
    /// <summary>Açıklama (çevirmen için not)</summary>
    public string? Description { get; set; }
    
    // Navigation Property
    /// <summary>İlgili dil</summary>
    public Language Language { get; set; } = null!;
}

