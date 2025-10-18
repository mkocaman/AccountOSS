using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Files.Queries.DownloadFile;

public record DownloadFileQuery(Guid FileId) : IRequest<Result<FileDownloadResult>>;

public record FileDownloadResult
{
    public Stream FileStream { get; init; } = null!;
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
}

