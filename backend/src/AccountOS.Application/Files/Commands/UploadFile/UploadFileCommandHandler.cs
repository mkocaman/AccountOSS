using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Files.Common;
using AccountOS.Domain.Entities;
using AccountOS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AccountOS.Application.Files.Commands.UploadFile;

public class UploadFileCommandHandler : IRequestHandler<UploadFileCommand, Result<FileDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorageService;

    public UploadFileCommandHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
    }

    public async Task<Result<FileDto>> Handle(UploadFileCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null || _currentUser.UserId == null)
            return Result<FileDto>.Fail("Kullanıcı bilgisi bulunamadı");

        // Default storage config al (LocalDisk)
        var config = await _context.FileStorageConfigurations
            .Where(c => c.CompanyId == _currentUser.CompanyId.Value && c.IsDefault)
            .FirstOrDefaultAsync(cancellationToken);

        if (config == null)
        {
            // Default LocalDisk config oluştur
            config = new FileStorageConfiguration
            {
                Id = Guid.NewGuid(),
                CompanyId = _currentUser.CompanyId.Value,
                Provider = StorageProvider.LocalDisk,
                Configuration = JsonSerializer.Serialize(new { BasePath = "uploads" }),
                IsActive = true,
                IsDefault = true,
                MaxFileSizeMb = 50,
                IsTested = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = _currentUser.UserId.Value
            };
            _context.FileStorageConfigurations.Add(config);
            await _context.SaveChangesAsync(cancellationToken);
        }

        // File size validation
        var fileSizeMb = request.FileSize / 1024m / 1024m;
        if (config.MaxFileSizeMb > 0 && fileSizeMb > config.MaxFileSizeMb)
        {
            return Result<FileDto>.Fail($"Dosya boyutu limit aşıyor. Max: {config.MaxFileSizeMb}MB");
        }

        // Upload file
        var filePath = await _fileStorageService.UploadFileAsync(
            request.FileStream,
            request.FileName,
            request.ContentType,
            null,
            cancellationToken);

        // Create StoredFile entity
        var storedFile = new StoredFile
        {
            Id = Guid.NewGuid(),
            CompanyId = _currentUser.CompanyId.Value,
            FileName = request.FileName,
            FilePath = filePath,
            FileSizeBytes = request.FileSize,
            ContentType = request.ContentType,
            FileExtension = Path.GetExtension(request.FileName),
            StorageProvider = config.Provider,
            IsPublic = request.IsPublic,
            Description = request.Description,
            Tags = request.Tags != null && request.Tags.Any() ? JsonSerializer.Serialize(request.Tags) : null,
            Version = 1,
            DownloadCount = 0,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = _currentUser.UserId.Value
        };

        _context.StoredFiles.Add(storedFile);

        // Update used storage
        config.UsedStorageMb += (long)fileSizeMb;
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new FileDto
        {
            Id = storedFile.Id,
            CompanyId = storedFile.CompanyId,
            FileName = storedFile.FileName,
            FilePath = storedFile.FilePath,
            FileSizeBytes = storedFile.FileSizeBytes,
            FileSizeFormatted = FormatFileSize(storedFile.FileSizeBytes),
            ContentType = storedFile.ContentType,
            FileExtension = storedFile.FileExtension,
            StorageProvider = storedFile.StorageProvider,
            StorageProviderName = storedFile.StorageProvider.ToString(),
            IsPublic = storedFile.IsPublic,
            PublicUrl = storedFile.PublicUrl,
            Description = storedFile.Description,
            DownloadCount = storedFile.DownloadCount,
            LastDownloadedAt = storedFile.LastDownloadedAt,
            Version = storedFile.Version,
            CreatedAt = storedFile.CreatedAt,
            CreatedByName = "User"
        };

        return Result<FileDto>.Ok(dto);
    }

    private string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len /= 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}

