namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Stok yönetim servisi
/// FIFO (First-In-First-Out) mantığı ile stok takibi
/// </summary>
public interface IStockService
{
    /// <summary>
    /// Stok girişi yap (Purchase, Return, Adjustment)
    /// Yeni stok katmanı (layer) oluşturur
    /// </summary>
    /// <param name="productId">Ürün ID</param>
    /// <param name="quantity">Miktar</param>
    /// <param name="unitCost">Birim maliyet</param>
    /// <param name="currency">Para birimi</param>
    /// <param name="referenceType">Referans tipi (Purchase, Return, Adjustment)</param>
    /// <param name="referenceId">Referans ID (Invoice ID, vb.)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>İşlem sonrası toplam stok miktarı</returns>
    Task<decimal> AddStockAsync(
        Guid productId,
        decimal quantity,
        decimal unitCost,
        string currency,
        string referenceType,
        Guid referenceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Stok çıkışı yap - FIFO mantığı ile (Sales, Transfer)
    /// En eski katmanlardan başlayarak stok tüketir
    /// </summary>
    /// <param name="productId">Ürün ID</param>
    /// <param name="quantity">Miktar</param>
    /// <param name="referenceType">Referans tipi (Sales, Transfer)</param>
    /// <param name="referenceId">Referans ID (Invoice ID, vb.)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>FIFO toplam maliyeti (baz para birimi)</returns>
    Task<decimal> RemoveStockAsync(
        Guid productId,
        decimal quantity,
        string referenceType,
        Guid referenceId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Ürünün toplam stok miktarını hesapla
    /// Tüm katmanların RemainingQuantity değerlerinin toplamı
    /// </summary>
    /// <param name="productId">Ürün ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Toplam stok miktarı</returns>
    Task<decimal> CalculateStockQuantityAsync(
        Guid productId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// FIFO maliyeti hesapla (satış fiyatı belirlerken kullanılır)
    /// Gerçek stok tüketmeden sadece maliyet hesaplaması yapar
    /// </summary>
    /// <param name="productId">Ürün ID</param>
    /// <param name="quantity">Miktar</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>FIFO toplam maliyeti (baz para birimi)</returns>
    Task<decimal> CalculateFifoCostAsync(
        Guid productId,
        decimal quantity,
        CancellationToken cancellationToken = default);
}

