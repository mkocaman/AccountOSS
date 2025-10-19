using System;
using System.Collections.Generic;
using AccountOS.Domain.Common;

namespace AccountOS.Domain.Entities;

/// <summary>
/// Ürün kategorisi entity'si - Ürünlerin kategorize edilmesi için
/// Hiyerarşik yapı destekler (alt kategori özelliği)
/// </summary>
public class ProductCategory : TenantEntity
{
    /// <summary>
    /// Kategori adı
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Kategori açıklaması
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Üst kategori ID - Alt kategori oluşturmak için
    /// </summary>
    public Guid? ParentCategoryId { get; set; }

    /// <summary>
    /// Üst kategori - Navigation property
    /// </summary>
    public virtual ProductCategory? ParentCategory { get; set; }

    /// <summary>
    /// Alt kategoriler - Navigation property
    /// </summary>
    public virtual ICollection<ProductCategory> SubCategories { get; set; }

    /// <summary>
    /// Bu kategorideki ürünler - Navigation property
    /// </summary>
    public virtual ICollection<Product> Products { get; set; }

    /// <summary>
    /// Kategori aktif mi?
    /// </summary>
    public bool IsActive { get; set; } = true;

    public ProductCategory()
    {
        SubCategories = new HashSet<ProductCategory>();
        Products = new HashSet<Product>();
    }
}

