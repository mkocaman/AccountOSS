using AccountOS.Application.Common;
using AccountOS.Application.Companies.Common;
using MediatR;

namespace AccountOS.Application.Companies.Queries.GetCompanies;

/// <summary>
/// Kullanıcının erişebildiği şirketleri listele
/// </summary>
public record GetCompaniesQuery : IRequest<Result<List<CompanyDto>>>;

