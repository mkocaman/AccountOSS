using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Customers.Commands.DeleteCustomer;

/// <summary>
/// Cari hesap silme komutu (soft delete)
/// </summary>
public record DeleteCustomerCommand(Guid Id) : IRequest<Result<bool>>;

