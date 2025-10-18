using AccountOS.Application.Accounting.Common;
using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Queries.GetTaxRateById;

public record GetTaxRateByIdQuery(Guid TaxRateId) : IRequest<Result<TaxRateDto>>;

