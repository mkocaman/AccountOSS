using FluentValidation;

namespace AccountOS.Application.Languages.Commands.CreateTranslation;

/// <summary>
/// Çeviri oluşturma doğrulayıcısı
/// </summary>
public class CreateTranslationCommandValidator : AbstractValidator<CreateTranslationCommand>
{
    public CreateTranslationCommandValidator()
    {
        RuleFor(x => x.LanguageCode)
            .NotEmpty().WithMessage("Dil kodu gereklidir")
            .Length(2).WithMessage("Dil kodu 2 karakter olmalıdır")
            .Matches("^[A-Z]{2}$").WithMessage("Dil kodu büyük harf olmalıdır");

        RuleFor(x => x.Key)
            .NotEmpty().WithMessage("Çeviri anahtarı gereklidir")
            .MaximumLength(200).WithMessage("Çeviri anahtarı en fazla 200 karakter olabilir");

        RuleFor(x => x.Value)
            .NotEmpty().WithMessage("Çeviri değeri gereklidir")
            .MaximumLength(1000).WithMessage("Çeviri değeri en fazla 1000 karakter olabilir");

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Kategori en fazla 50 karakter olabilir")
            .When(x => !string.IsNullOrWhiteSpace(x.Category));
    }
}

