using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Companies.Commands.DeleteCompany;

/// <summary>
/// Şirket silme komutu (soft delete)
/// </summary>
public record DeleteCompanyCommand(Guid Id) : IRequest<Result<bool>>;

