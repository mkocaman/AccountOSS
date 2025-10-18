using FluentValidation;

namespace AccountOS.Application.Companies.Commands.UpdateCompany;

/// <summary>
/// Şirket güncelleme komutu doğrulayıcısı
/// </summary>
public class UpdateCompanyCommandValidator : AbstractValidator<UpdateCompanyCommand>
{
    public UpdateCompanyCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Şirket ID gereklidir");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Şirket adı gereklidir")
            .MaximumLength(200).WithMessage("Şirket adı en fazla 200 karakter olabilir");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.BaseCurrency)
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır")
            .When(x => !string.IsNullOrWhiteSpace(x.BaseCurrency));

        RuleFor(x => x.DefaultLanguage)
            .Length(2).WithMessage("Dil kodu 2 karakter olmalıdır")
            .Matches("^[A-Z]{2}$").WithMessage("Dil kodu büyük harf olmalıdır")
            .When(x => !string.IsNullOrWhiteSpace(x.DefaultLanguage));
    }
}

