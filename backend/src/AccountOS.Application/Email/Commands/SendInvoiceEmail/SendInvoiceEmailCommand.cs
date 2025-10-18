using AccountOS.Application.Common;
using MediatR;

namespace AccountOS.Application.Email.Commands.SendInvoiceEmail;

public record SendInvoiceEmailCommand : IRequest<Result<bool>>
{
    public Guid InvoiceId { get; init; }
    public string? AdditionalMessage { get; init; }
}

