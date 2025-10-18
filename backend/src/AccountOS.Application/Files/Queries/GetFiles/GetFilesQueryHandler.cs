using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using AccountOS.Application.Files.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Files.Queries.GetFiles;

public class GetFilesQueryHandler : IRequestHandler<GetFilesQuery, Result<List<FileDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetFilesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<FileDto>>> Handle(GetFilesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<List<FileDto>>.Fail("Kullanıcı bilgisi bulunamadı");

        var query = _context.StoredFiles
            .Where(f => f.CompanyId == _currentUser.CompanyId.Value);

        if (request.Provider.HasValue)
            query = query.Where(f => f.StorageProvider == request.Provider.Value);

        if (!string.IsNullOrWhiteSpace(request.FileExtension))
            query = query.Where(f => f.FileExtension == request.FileExtension);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            query = query.Where(f => f.FileName.Contains(request.SearchTerm) || 
                                    (f.Description != null && f.Description.Contains(request.SearchTerm)));

        var skip = (request.PageNumber - 1) * request.PageSize;

        var files = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip(skip)
            .Take(request.PageSize)
            .Select(f => new FileDto
            {
                Id = f.Id,
                CompanyId = f.CompanyId,
                FileName = f.FileName,
                FilePath = f.FilePath,
                FileSizeBytes = f.FileSizeBytes,
                FileSizeFormatted = FormatFileSize(f.FileSizeBytes),
                ContentType = f.ContentType,
                FileExtension = f.FileExtension,
                StorageProvider = f.StorageProvider,
                StorageProviderName = f.StorageProvider.ToString(),
                IsPublic = f.IsPublic,
                PublicUrl = f.PublicUrl,
                Description = f.Description,
                DownloadCount = f.DownloadCount,
                LastDownloadedAt = f.LastDownloadedAt,
                Version = f.Version,
                CreatedAt = f.CreatedAt,
                CreatedByName = "User"
            })
            .ToListAsync(cancellationToken);

        return Result<List<FileDto>>.Ok(files);
    }

    private static string FormatFileSize(long bytes)
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

