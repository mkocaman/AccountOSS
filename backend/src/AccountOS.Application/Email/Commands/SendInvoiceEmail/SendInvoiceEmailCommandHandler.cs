using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Email.Commands.SendInvoiceEmail;

public class SendInvoiceEmailCommandHandler 
    : IRequestHandler<SendInvoiceEmailCommand, Result<bool>>
{
    private readonly IEmailService _emailService;

    public SendInvoiceEmailCommandHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<Result<bool>> Handle(
        SendInvoiceEmailCommand request, 
        CancellationToken cancellationToken)
    {
        var success = await _emailService.SendInvoiceEmailAsync(
            request.InvoiceId,
            request.AdditionalMessage,
            cancellationToken);

        if (success)
            return Result<bool>.Ok(true);

        return Result<bool>.Fail("Fatura email'i gönderilemedi");
    }
}

