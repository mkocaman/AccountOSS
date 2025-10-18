using AccountOS.Domain.Enums;

namespace AccountOS.Application.Files.Common;

public record FileStorageConfigurationDto
{
    public Guid Id { get; init; }
    public StorageProvider Provider { get; init; }
    public string ProviderName { get; init; } = string.Empty;
    public string ConfigurationSanitized { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public bool IsDefault { get; init; }
    public decimal? StorageQuotaMb { get; init; }
    public decimal UsedStorageMb { get; init; }
    public decimal? RemainingStorageMb { get; init; }
    public decimal? MaxFileSizeMb { get; init; }
    public bool IsTested { get; init; }
    public DateTime? LastTestedAt { get; init; }
}

