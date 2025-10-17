using MediatR;
using AccountOS.Application.Common;

namespace AccountOS.Application.Features.Sample.Queries.GetSample;

/// <summary>
/// Örnek Query
/// Query pattern - veri okuma işlemleri için
/// </summary>
public record GetSampleQuery : IRequest<Result<SampleDto>>
{
    public Guid Id { get; init; }
}

/// <summary>
/// Sample DTO
/// </summary>
public record SampleDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

