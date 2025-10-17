using MediatR;
using AccountOS.Application.Common;

namespace AccountOS.Application.Features.Sample.Commands.CreateSample;

/// <summary>
/// Örnek Command
/// Command pattern - veri değiştiren işlemler için
/// </summary>
public record CreateSampleCommand : IRequest<Result<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
}

