namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// PDF oluşturma servisi
/// Fatura, teklif, sözleşme vb. için PDF üretir
/// </summary>
public interface IPdfService
{
    /// <summary>
    /// HTML'den PDF oluşturur
    /// </summary>
    Task<byte[]> GeneratePdfFromHtmlAsync(string html, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Template'den PDF oluşturur
    /// </summary>
    Task<byte[]> GeneratePdfFromTemplateAsync(
        string templateName, 
        Dictionary<string, object> data,
        CancellationToken cancellationToken = default);
}

