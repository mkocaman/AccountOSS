using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Ürün çoklu dil çevirisi
/// </summary>
public class ProductTranslation : BaseEntity
{
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; set; }
    
    /// <summary>Dil kodu (TR, EN, RU, vb.)</summary>
    public string LanguageCode { get; set; } = string.Empty;
    
    /// <summary>Çevrilmiş ürün adı</summary>
    public string Name { get; set; } = string.Empty;
    
    /// <summary>Çevrilmiş açıklama</summary>
    public string? Description { get; set; }
    
    // Navigation Property
    /// <summary>İlgili ürün</summary>
    public Product Product { get; set; } = null!;
}

