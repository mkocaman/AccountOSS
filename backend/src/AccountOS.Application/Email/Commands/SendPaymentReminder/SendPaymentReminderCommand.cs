using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Email.Commands.SendPaymentReminder;

public record SendPaymentReminderCommand(Guid InvoiceId) : IRequest<Result<bool>>;

