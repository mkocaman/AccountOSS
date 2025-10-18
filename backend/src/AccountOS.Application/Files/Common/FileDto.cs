using AccountOS.Domain.Enums;

namespace AccountOS.Application.Files.Common;

public record FileDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string FilePath { get; init; } = string.Empty;
    public long FileSizeBytes { get; init; }
    public string FileSizeFormatted { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public string FileExtension { get; init; } = string.Empty;
    public StorageProvider StorageProvider { get; init; }
    public string StorageProviderName { get; init; } = string.Empty;
    public bool IsPublic { get; init; }
    public string? PublicUrl { get; init; }
    public string? Description { get; init; }
    public long DownloadCount { get; init; }
    public DateTime? LastDownloadedAt { get; init; }
    public int Version { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedByName { get; init; } = string.Empty;
}

