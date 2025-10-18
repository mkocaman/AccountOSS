using AccountOS.Application.Common;
using AccountOS.Application.Products.Common;
using MediatR;

namespace AccountOS.Application.Products.Queries.GetProductById;

/// <summary>
/// ID'ye göre ürün getir
/// </summary>
public record GetProductByIdQuery(Guid Id) : IRequest<Result<ProductDto>>;

