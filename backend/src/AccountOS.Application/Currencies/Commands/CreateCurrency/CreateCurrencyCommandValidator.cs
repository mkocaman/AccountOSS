using FluentValidation;

namespace AccountOS.Application.Currencies.Commands.CreateCurrency;

/// <summary>
/// Para birimi oluşturma doğrulayıcısı
/// </summary>
public class CreateCurrencyCommandValidator : AbstractValidator<CreateCurrencyCommand>
{
    public CreateCurrencyCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Para birimi kodu gereklidir")
            .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır (ISO 4217)")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi kodu büyük harf olmalıdır");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Para birimi adı gereklidir")
            .MaximumLength(100).WithMessage("Para birimi adı en fazla 100 karakter olabilir");

        RuleFor(x => x.Symbol)
            .NotEmpty().WithMessage("Sembol gereklidir")
            .MaximumLength(10).WithMessage("Sembol en fazla 10 karakter olabilir");

        RuleFor(x => x.DecimalPlaces)
            .GreaterThanOrEqualTo(0).WithMessage("Ondalık basamak sayısı 0 veya daha büyük olmalıdır")
            .LessThanOrEqualTo(4).WithMessage("Ondalık basamak sayısı en fazla 4 olabilir");
    }
}

