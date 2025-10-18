using FluentValidation;

namespace AccountOS.Application.Languages.Commands.UpdateLanguage;

/// <summary>
/// Dil güncelleme doğrulayıcısı
/// </summary>
public class UpdateLanguageCommandValidator : AbstractValidator<UpdateLanguageCommand>
{
    public UpdateLanguageCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Dil ID gereklidir");

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

