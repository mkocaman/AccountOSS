using AccountOS.Application.Common;
using AccountOS.Application.Files.Common;
using MediatR;

namespace AccountOS.Application.Files.Commands.UploadFile;

public record UploadFileCommand : IRequest<Result<FileDto>>
{
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string? Description { get; init; }
    public List<string>? Tags { get; init; }
    public bool IsPublic { get; init; }
}

