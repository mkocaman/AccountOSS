namespace AccountOS.Application.Invoices.Common;

/// <summary>
/// Fatura kalemi DTO'su
/// </summary>
public class InvoiceItemDto
{
    /// <summary>Fatura kalemi ID</summary>
    public Guid Id { get; set; }
    
    /// <summary>Satır numarası</summary>
    public int LineNumber { get; set; }
    
    /// <summary>Ürün ID</summary>
    public Guid ProductId { get; set; }
    
    /// <summary>Ürün adı</summary>
    public string ProductName { get; set; } = string.Empty;
    
    /// <summary>Ürün kodu</summary>
    public string ProductCode { get; set; } = string.Empty;
    
    /// <summary>Açıklama</summary>
    public string? Description { get; set; }
    
    /// <summary>Miktar</summary>
    public decimal Quantity { get; set; }
    
    /// <summary>Birim</summary>
    public string Unit { get; set; } = string.Empty;
    
    /// <summary>Birim fiyat</summary>
    public decimal UnitPrice { get; set; }
    
    /// <summary>İndirim yüzdesi</summary>
    public decimal DiscountPercentage { get; set; }
    
    /// <summary>İndirim tutarı</summary>
    public decimal DiscountAmount { get; set; }
    
    /// <summary>KDV oranı</summary>
    public decimal VatRate { get; set; }
    
    /// <summary>Ara toplam (indirim sonrası)</summary>
    public decimal SubTotal { get; set; }
    
    /// <summary>KDV tutarı</summary>
    public decimal VatAmount { get; set; }
    
    /// <summary>Toplam (KDV dahil)</summary>
    public decimal Total { get; set; }
    
    /// <summary>FIFO maliyet (satış faturaları için)</summary>
    public decimal? FifoCost { get; set; }
}
