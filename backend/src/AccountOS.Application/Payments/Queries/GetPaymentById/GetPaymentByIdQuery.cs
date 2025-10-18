using AccountOS.Application.Common;
using AccountOS.Application.Payments.Common;
using MediatR;

namespace AccountOS.Application.Payments.Queries.GetPaymentById;

public record GetPaymentByIdQuery(Guid Id) : IRequest<Result<PaymentDto>>;

