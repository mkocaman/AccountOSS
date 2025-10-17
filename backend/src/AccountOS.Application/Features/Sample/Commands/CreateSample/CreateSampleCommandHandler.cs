using MediatR;
using AccountOS.Application.Common;

namespace AccountOS.Application.Features.Sample.Commands.CreateSample;

/// <summary>
/// CreateSampleCommand Handler
/// İş mantığını içerir
/// </summary>
public class CreateSampleCommandHandler : IRequestHandler<CreateSampleCommand, Result<Guid>>
{
    // Dependencies buraya inject edilir
    // private readonly IApplicationDbContext _context;
    
    public CreateSampleCommandHandler()
    {
        // _context = context;
    }
    
    public async Task<Result<Guid>> Handle(CreateSampleCommand request, CancellationToken cancellationToken)
    {
        // İş mantığı burada
        // Örnek:
        // var entity = new SampleEntity
        // {
        //     Name = request.Name,
        //     Description = request.Description
        // };
        
        // await _context.SampleEntities.AddAsync(entity, cancellationToken);
        // await _context.SaveChangesAsync(cancellationToken);
        
        // return Result<Guid>.Ok(entity.Id);
        
        // Şimdilik dummy response
        return await Task.FromResult(Result<Guid>.Ok(Guid.NewGuid()));
    }
}

