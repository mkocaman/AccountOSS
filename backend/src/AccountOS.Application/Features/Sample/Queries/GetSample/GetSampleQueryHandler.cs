using MediatR;
using AccountOS.Application.Common;
using AccountOS.Application.Common.Exceptions;

namespace AccountOS.Application.Features.Sample.Queries.GetSample;

/// <summary>
/// GetSampleQuery Handler
/// </summary>
public class GetSampleQueryHandler : IRequestHandler<GetSampleQuery, Result<SampleDto>>
{
    // Dependencies buraya inject edilir
    // private readonly IApplicationDbContext _context;
    
    public GetSampleQueryHandler()
    {
        // _context = context;
    }
    
    public async Task<Result<SampleDto>> Handle(GetSampleQuery request, CancellationToken cancellationToken)
    {
        // İş mantığı burada
        // Örnek:
        // var entity = await _context.SampleEntities
        //     .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        
        // if (entity == null)
        // {
        //     throw new NotFoundException(nameof(SampleEntity), request.Id);
        // }
        
        // var dto = new SampleDto
        // {
        //     Id = entity.Id,
        //     Name = entity.Name,
        //     Description = entity.Description
        // };
        
        // return Result<SampleDto>.Ok(dto);
        
        // Şimdilik dummy response
        return await Task.FromResult(Result<SampleDto>.Ok(new SampleDto
        {
            Id = request.Id,
            Name = "Sample Name",
            Description = "Sample Description"
        }));
    }
}

