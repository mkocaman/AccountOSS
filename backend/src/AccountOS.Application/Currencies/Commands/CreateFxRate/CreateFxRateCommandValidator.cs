using FluentValidation;

namespace AccountOS.Application.Currencies.Commands.CreateFxRate;

/// <summary>
/// Döviz kuru oluşturma doğrulayıcısı
/// </summary>
public class CreateFxRateCommandValidator : AbstractValidator<CreateFxRateCommand>
{
    public CreateFxRateCommandValidator()
    {
        RuleFor(x => x.BaseCurrencyCode)
            .NotEmpty().WithMessage("Baz para birimi kodu gereklidir")
            .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır");

        RuleFor(x => x.QuoteCurrencyCode)
            .NotEmpty().WithMessage("Hedef para birimi kodu gereklidir")
            .Length(3).WithMessage("Para birimi kodu 3 karakter olmalıdır");

        RuleFor(x => x.Rate)
            .GreaterThan(0).WithMessage("Kur 0'dan büyük olmalıdır");

        RuleFor(x => x.EffectiveDate)
            .NotEmpty().WithMessage("Geçerlilik tarihi gereklidir");

        RuleFor(x => x.Source)
            .NotEmpty().WithMessage("Kaynak bilgisi gereklidir")
            .MaximumLength(50).WithMessage("Kaynak en fazla 50 karakter olabilir");
    }
}

