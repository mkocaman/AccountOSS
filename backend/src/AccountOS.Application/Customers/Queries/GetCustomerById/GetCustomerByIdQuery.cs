using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using MediatR;

namespace AccountOS.Application.Customers.Queries.GetCustomerById;

/// <summary>
/// ID'ye göre cari hesap getir
/// </summary>
public record GetCustomerByIdQuery(Guid Id) : IRequest<Result<CustomerDto>>;

