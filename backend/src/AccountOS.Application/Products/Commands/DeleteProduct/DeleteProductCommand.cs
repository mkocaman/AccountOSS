using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Products.Commands.DeleteProduct;

/// <summary>
/// Ürün silme komutu (soft delete)
/// </summary>
public record DeleteProductCommand(Guid Id) : IRequest<Result<bool>>;

