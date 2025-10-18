using FluentValidation;

namespace AccountOS.Application.Languages.Commands.CreateLanguage;

/// <summary>
/// Dil oluşturma doğrulayıcısı
/// </summary>
public class CreateLanguageCommandValidator : AbstractValidator<CreateLanguageCommand>
{
    public CreateLanguageCommandValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Dil kodu gereklidir")
            .Length(2).WithMessage("Dil kodu 2 karakter olmalıdır (ISO 639-1)")
            .Matches("^[A-Z]{2}$").WithMessage("Dil kodu büyük harf olmalıdır");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Dil adı gereklidir")
            .MaximumLength(100).WithMessage("Dil adı en fazla 100 karakter olabilir");

        RuleFor(x => x.NativeName)
            .NotEmpty().WithMessage("Yerel dil adı gereklidir")
            .MaximumLength(100).WithMessage("Yerel dil adı en fazla 100 karakter olabilir");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Görüntüleme sırası 0 veya daha büyük olmalıdır");
    }
}

