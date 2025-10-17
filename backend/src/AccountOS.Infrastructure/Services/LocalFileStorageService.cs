using Microsoft.Extensions.Logging;
using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Infrastructure.Services;

/// <summary>
/// Local disk file storage implementasyonu
/// Geliştirme ortamı için
/// Production'da AWS S3 veya Azure Blob kullanılabilir
/// </summary>
public class LocalFileStorageService : IFileStorageService
{
    private readonly ILogger<LocalFileStorageService> _logger;
    private readonly string _basePath;

    public LocalFileStorageService(ILogger<LocalFileStorageService> logger)
    {
        _logger = logger;
        // wwwroot/uploads klasörü
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        
        // Klasör yoksa oluştur
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream, 
        string fileName, 
        string folder = "uploads", 
        CancellationToken cancellationToken = default)
    {
        var folderPath = Path.Combine(_basePath, folder);
        
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }
        
        // Güvenli dosya adı oluştur
        var safeFileName = $"{Guid.NewGuid()}_{Path.GetFileName(fileName)}";
        var filePath = Path.Combine(folderPath, safeFileName);
        
        // Dosyayı kaydet
        await using var fileStreamOut = File.Create(filePath);
        await fileStream.CopyToAsync(fileStreamOut, cancellationToken);
        
        _logger.LogInformation("Dosya yüklendi: {FilePath}", filePath);
        
        // Relative path döndür
        return Path.Combine(folder, safeFileName);
    }

    public Task<Stream> DownloadFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        
        if (!File.Exists(fullPath))
        {
            throw new FileNotFoundException("Dosya bulunamadı", filePath);
        }
        
        Stream stream = File.OpenRead(fullPath);
        return Task.FromResult(stream);
    }

    public Task DeleteFileAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        
        if (File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Dosya silindi: {FilePath}", filePath);
        }
        
        return Task.CompletedTask;
    }

    public Task<bool> FileExistsAsync(string filePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return Task.FromResult(File.Exists(fullPath));
    }

    public async Task<string> CreateTempFileAsync(
        Stream stream, 
        string extension, 
        CancellationToken cancellationToken = default)
    {
        var tempFileName = $"{Guid.NewGuid()}{extension}";
        var tempPath = Path.Combine(Path.GetTempPath(), tempFileName);
        
        await using var fileStream = File.Create(tempPath);
        await stream.CopyToAsync(fileStream, cancellationToken);
        
        return tempPath;
    }
}

