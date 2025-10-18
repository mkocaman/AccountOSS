using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using AccountOS.Application.Search.Common;
using MediatR;

namespace AccountOS.Application.Search.Queries.SearchCustomers;

/// <summary>
/// Gelişmiş müşteri arama query
/// </summary>
public record SearchCustomersQuery : IRequest<Result<List<CustomerDto>>>
{
    public CustomerSearchFilter Filter { get; init; } = new();
}

