using AccountOS.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services.FileStorage;

/// <summary>
/// Local disk storage provider
/// </summary>
public class LocalDiskStorageProvider : IFileStorageService
{
    private readonly ILogger<LocalDiskStorageProvider> _logger;
    private readonly string _basePath;

    public LocalDiskStorageProvider(ILogger<LocalDiskStorageProvider> logger)
    {
        _logger = logger;
        _basePath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        
        // Uploads klasörünü oluştur
        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Dictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Unique dosya adı oluştur
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(_basePath, uniqueFileName);

            // Dosyayı kaydet
            using var fileStreamOutput = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamOutput, cancellationToken);

            _logger.LogInformation("File uploaded to local disk: {FileName}", uniqueFileName);

            return uniqueFileName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to local disk: {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);

            if (!File.Exists(fullPath))
            {
                throw new FileNotFoundException($"File not found: {filePath}");
            }

            var memoryStream = new MemoryStream();
            using var fileStream = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            await fileStream.CopyToAsync(memoryStream, cancellationToken);
            memoryStream.Position = 0;

            return memoryStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from local disk: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPath = Path.Combine(_basePath, filePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted from local disk: {FilePath}", filePath);
                return true;
            }

            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from local disk: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(_basePath, filePath);
        return File.Exists(fullPath);
    }

    public async Task<string?> GetPublicUrlAsync(
        string filePath,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default)
    {
        // Local disk doesn't support public URLs
        return null;
    }

    public async Task<bool> TestConnectionAsync(
        string configuration,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = JsonSerializer.Deserialize<Dictionary<string, string>>(configuration);
            var basePath = config?.GetValueOrDefault("BasePath") ?? _basePath;

            // Test write permission
            var testFile = Path.Combine(basePath, $"test_{Guid.NewGuid()}.txt");
            await File.WriteAllTextAsync(testFile, "test", cancellationToken);
            File.Delete(testFile);

            return true;
        }
        catch
        {
            return false;
        }
    }
}

