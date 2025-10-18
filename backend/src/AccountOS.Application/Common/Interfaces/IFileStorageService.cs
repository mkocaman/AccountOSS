namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// File storage servisi (multi-provider support)
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Dosya yükle
    /// </summary>
    Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Dictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Dosya indir
    /// </summary>
    Task<Stream> DownloadFileAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Dosya sil
    /// </summary>
    Task<bool> DeleteFileAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Dosya var mı kontrol et
    /// </summary>
    Task<bool> FileExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Public URL al (CDN için)
    /// </summary>
    Task<string?> GetPublicUrlAsync(
        string filePath,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Bağlantıyı test et
    /// </summary>
    Task<bool> TestConnectionAsync(
        string configuration,
        CancellationToken cancellationToken = default);
}
