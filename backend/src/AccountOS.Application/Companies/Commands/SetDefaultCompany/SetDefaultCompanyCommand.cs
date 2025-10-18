using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Companies.Commands.SetDefaultCompany;

/// <summary>
/// Varsayılan şirket belirleme komutu
/// </summary>
public record SetDefaultCompanyCommand(Guid CompanyId) : IRequest<Result<bool>>;

