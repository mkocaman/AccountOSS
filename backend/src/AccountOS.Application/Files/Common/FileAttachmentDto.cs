namespace AccountOS.Application.Files.Common;

public record FileAttachmentDto
{
    public Guid Id { get; init; }
    public Guid FileId { get; init; }
    public string EntityType { get; init; } = string.Empty;
    public Guid EntityId { get; init; }
    public string? Description { get; init; }
    public int DisplayOrder { get; init; }
    public FileDto File { get; init; } = null!;
    public DateTime CreatedAt { get; init; }
}

