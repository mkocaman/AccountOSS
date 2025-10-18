using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AccountOS.Application.Files.Queries.DownloadFile;

public class DownloadFileQueryHandler : IRequestHandler<DownloadFileQuery, Result<FileDownloadResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorageService;

    public DownloadFileQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService)
    {
        _context = context;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
    }

    public async Task<Result<FileDownloadResult>> Handle(DownloadFileQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.CompanyId == null)
            return Result<FileDownloadResult>.Fail("Kullanıcı bilgisi bulunamadı");

        var file = await _context.StoredFiles
            .Where(f => f.Id == request.FileId && f.CompanyId == _currentUser.CompanyId.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (file == null)
            return Result<FileDownloadResult>.Fail("Dosya bulunamadı");

        var stream = await _fileStorageService.DownloadFileAsync(
            file.FilePath,
            cancellationToken);

        // Update download stats
        file.DownloadCount++;
        file.LastDownloadedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        var result = new FileDownloadResult
        {
            FileStream = stream,
            FileName = file.FileName,
            ContentType = file.ContentType
        };

        return Result<FileDownloadResult>.Ok(result);
    }
}

