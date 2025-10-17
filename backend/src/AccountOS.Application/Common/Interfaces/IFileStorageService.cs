namespace AccountOS.Application.Common.Interfaces;

/// <summary>
/// Dosya depolama servisi
/// Local disk, AWS S3, Azure Blob gibi storage kullanılabilir
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Dosya yükler
    /// </summary>
    /// <returns>Dosyanın URL'i veya path'i</returns>
    Task<string> UploadFileAsync(
        Stream fileStream, 
        string fileName, 
        string folder = "uploads",
        CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Dosya indirir
    /// </summary>
    Task<Stream> DownloadFileAsync(string filePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Dosya siler
    /// </summary>
    Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Dosya var mı?
    /// </summary>
    Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Geçici dosya oluşturur (örn: PDF oluşturma için)
    /// </summary>
    Task<string> CreateTempFileAsync(Stream stream, string extension, CancellationToken cancellationToken = default);
}

