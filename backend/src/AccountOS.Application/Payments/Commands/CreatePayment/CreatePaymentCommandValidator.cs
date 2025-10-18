using FluentValidation;

namespace AccountOS.Application.Payments.Commands.CreatePayment;

/// <summary>
/// Ödeme kaydetme doğrulayıcısı
/// </summary>
public class CreatePaymentCommandValidator : AbstractValidator<CreatePaymentCommand>
{
    public CreatePaymentCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Cari hesap seçimi zorunludur");

        RuleFor(x => x.PaymentDate)
            .NotEmpty().WithMessage("Ödeme tarihi gereklidir")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Ödeme tarihi gelecek olamaz");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Ödeme tutarı 0'dan büyük olmalıdır");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi gereklidir")
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır");
    }
}

