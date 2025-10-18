using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Accounting.Commands.DeleteTaxRate;

public record DeleteTaxRateCommand(Guid TaxRateId) : IRequest<Result<bool>>;

