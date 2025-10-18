using AccountOS.Application.Common;
using AccountOS.Application.Common.Interfaces;
using MediatR;

namespace AccountOS.Application.Email.Commands.SendPaymentReminder;

public class SendPaymentReminderCommandHandler 
    : IRequestHandler<SendPaymentReminderCommand, Result<bool>>
{
    private readonly IEmailService _emailService;

    public SendPaymentReminderCommandHandler(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<Result<bool>> Handle(
        SendPaymentReminderCommand request, 
        CancellationToken cancellationToken)
    {
        var success = await _emailService.SendPaymentReminderAsync(
            request.InvoiceId,
            cancellationToken);

        if (success)
            return Result<bool>.Ok(true);

        return Result<bool>.Fail("Ödeme hatırlatması gönderilemedi");
    }
}

