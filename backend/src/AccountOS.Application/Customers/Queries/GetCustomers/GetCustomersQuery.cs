using AccountOS.Application.Common;
using AccountOS.Application.Customers.Common;
using MediatR;

namespace AccountOS.Application.Customers.Queries.GetCustomers;

/// <summary>
/// Cari hesapları listele
/// </summary>
public record GetCustomersQuery : IRequest<Result<List<CustomerDto>>>
{
    /// <summary>Arama terimi (ad, kod, email)</summary>
    public string? SearchTerm { get; init; }
    
    /// <summary>Sadece aktif cari hesapları getir</summary>
    public bool ActiveOnly { get; init; } = true;
}

