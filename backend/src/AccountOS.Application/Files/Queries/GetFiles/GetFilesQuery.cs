using AccountOS.Application.Common;
using AccountOS.Application.Files.Common;
using AccountOS.Domain.Enums;
using MediatR;

namespace AccountOS.Application.Files.Queries.GetFiles;

public record GetFilesQuery : IRequest<Result<List<FileDto>>>
{
    public StorageProvider? Provider { get; init; }
    public string? FileExtension { get; init; }
    public string? SearchTerm { get; init; }
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 50;
}

