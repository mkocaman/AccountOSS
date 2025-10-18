using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services.FileStorage;

/// <summary>
/// Main file storage service (router to providers)
/// </summary>
public class FileStorageService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LocalDiskStorageProvider _localDisk;
    private readonly CustomCdnStorageProvider _customCdn;
    private readonly ILogger<FileStorageService> _logger;

    public FileStorageService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        LocalDiskStorageProvider localDisk,
        CustomCdnStorageProvider customCdn,
        ILogger<FileStorageService> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _localDisk = localDisk;
        _customCdn = customCdn;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(
        StorageProvider provider,
        Stream fileStream,
        string fileName,
        string contentType,
        string? configuration = null,
        CancellationToken cancellationToken = default)
    {
        var metadata = configuration != null 
            ? JsonSerializer.Deserialize<Dictionary<string, string>>(configuration)
            : null;

        return provider switch
        {
            StorageProvider.LocalDisk => await _localDisk.UploadFileAsync(fileStream, fileName, contentType, metadata, cancellationToken),
            StorageProvider.CustomCdn => await _customCdn.UploadFileAsync(fileStream, fileName, contentType, metadata, cancellationToken),
            StorageProvider.AzureBlob => throw new NotImplementedException("Azure Blob storage not implemented yet"),
            StorageProvider.AwsS3 => throw new NotImplementedException("AWS S3 storage not implemented yet"),
            _ => throw new ArgumentException($"Unknown storage provider: {provider}")
        };
    }

    public async Task<Stream> DownloadFileAsync(
        StorageProvider provider,
        string filePath,
        string? configuration = null,
        CancellationToken cancellationToken = default)
    {
        return provider switch
        {
            StorageProvider.LocalDisk => await _localDisk.DownloadFileAsync(filePath, cancellationToken),
            StorageProvider.CustomCdn => await _customCdn.DownloadFileAsync(filePath, cancellationToken),
            StorageProvider.AzureBlob => throw new NotImplementedException("Azure Blob storage not implemented yet"),
            StorageProvider.AwsS3 => throw new NotImplementedException("AWS S3 storage not implemented yet"),
            _ => throw new ArgumentException($"Unknown storage provider: {provider}")
        };
    }

    public async Task<bool> DeleteFileAsync(
        StorageProvider provider,
        string filePath,
        string? configuration = null,
        CancellationToken cancellationToken = default)
    {
        return provider switch
        {
            StorageProvider.LocalDisk => await _localDisk.DeleteFileAsync(filePath, cancellationToken),
            StorageProvider.CustomCdn => await _customCdn.DeleteFileAsync(filePath, cancellationToken),
            StorageProvider.AzureBlob => throw new NotImplementedException("Azure Blob storage not implemented yet"),
            StorageProvider.AwsS3 => throw new NotImplementedException("AWS S3 storage not implemented yet"),
            _ => throw new ArgumentException($"Unknown storage provider: {provider}")
        };
    }

    public async Task<bool> TestConnectionAsync(
        StorageProvider provider,
        string configuration,
        CancellationToken cancellationToken = default)
    {
        return provider switch
        {
            StorageProvider.LocalDisk => await _localDisk.TestConnectionAsync(configuration, cancellationToken),
            StorageProvider.CustomCdn => await _customCdn.TestConnectionAsync(configuration, cancellationToken),
            StorageProvider.AzureBlob => throw new NotImplementedException("Azure Blob storage not implemented yet"),
            StorageProvider.AwsS3 => throw new NotImplementedException("AWS S3 storage not implemented yet"),
            _ => false
        };
    }
}

