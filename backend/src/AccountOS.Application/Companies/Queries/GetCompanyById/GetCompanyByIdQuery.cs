using AccountOS.Application.Common;
using AccountOS.Application.Companies.Common;
using MediatR;

namespace AccountOS.Application.Companies.Queries.GetCompanyById;

/// <summary>
/// ID'ye göre şirket detayı getir
/// </summary>
public record GetCompanyByIdQuery(Guid Id) : IRequest<Result<CompanyDto>>;

