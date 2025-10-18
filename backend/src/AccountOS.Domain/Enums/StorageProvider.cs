namespace AccountOS.Domain.Enums;

/// <summary>
/// Dosya depolama sağlayıcısı
/// </summary>
public enum StorageProvider
{
    /// <summary>Local disk storage (default, free)</summary>
    LocalDisk = 0,
    
    /// <summary>Azure Blob Storage (enterprise)</summary>
    AzureBlob = 1,
    
    /// <summary>AWS S3 (enterprise)</summary>
    AwsS3 = 2,
    
    /// <summary>Custom CDN URL (flexible)</summary>
    CustomCdn = 3
}

