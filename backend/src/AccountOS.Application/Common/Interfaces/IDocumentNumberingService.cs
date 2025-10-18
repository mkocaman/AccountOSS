namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Evrak numaralandırma servisi
/// </summary>
public interface IDocumentNumberingService
{
    /// <summary>
    /// Yeni evrak numarası oluştur
    /// </summary>
    Task<string> GenerateNumberAsync(
        string documentType,
        string? subType = null,
        DateTime? documentDate = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Şablon örneği oluştur
    /// </summary>
    string GenerateExample(
        string template,
        string prefix,
        bool includeYear,
        string yearFormat,
        bool includeMonth,
        string monthFormat,
        int sequenceLength,
        int startingNumber);
}

