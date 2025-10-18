using AccountOS.Domain.Enums;
using FluentValidation;

namespace AccountOS.Application.Customers.Commands.UpdateCustomer;

/// <summary>
/// Cari hesap güncelleme doğrulayıcısı
/// </summary>
public class UpdateCustomerCommandValidator : AbstractValidator<UpdateCustomerCommand>
{
    public UpdateCustomerCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Cari hesap ID gereklidir");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Cari hesap adı gereklidir")
            .MaximumLength(200).WithMessage("Cari hesap adı en fazla 200 karakter olabilir");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Currency)
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır")
            .When(x => !string.IsNullOrWhiteSpace(x.Currency));

        RuleFor(x => x.TaxNumber)
            .NotEmpty().WithMessage("Kurumsal müşteriler için vergi numarası zorunludur")
            .When(x => x.Type == CustomerType.Corporate);

        RuleFor(x => x.IdentityNumber)
            .NotEmpty().WithMessage("Bireysel müşteriler için TC Kimlik No zorunludur")
            .Length(11).WithMessage("TC Kimlik No 11 haneli olmalıdır")
            .Matches("^[0-9]{11}$").WithMessage("TC Kimlik No sadece rakam içermelidir")
            .When(x => x.Type == CustomerType.Individual);

        RuleFor(x => x.CreditLimit)
            .GreaterThanOrEqualTo(0).WithMessage("Kredi limiti 0 veya daha büyük olmalıdır");

        RuleFor(x => x.PaymentTermDays)
            .GreaterThanOrEqualTo(0).WithMessage("Vade gün sayısı 0 veya daha büyük olmalıdır")
            .LessThanOrEqualTo(365).WithMessage("Vade gün sayısı en fazla 365 olabilir");
    }
}

