using FluentValidation;

namespace AccountOS.Application.Companies.Commands.CreateCompany;

/// <summary>
/// Şirket oluşturma komutu doğrulayıcısı
/// </summary>
public class CreateCompanyCommandValidator : AbstractValidator<CreateCompanyCommand>
{
    public CreateCompanyCommandValidator()
    {
        // Şirket adı zorunlu
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Şirket adı gereklidir")
            .MaximumLength(200).WithMessage("Şirket adı en fazla 200 karakter olabilir");

        // E-posta formatı kontrolü
        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        // Para birimi formatı (3 karakter)
        RuleFor(x => x.BaseCurrency)
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır (örn: TRY, USD)")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır");

        // Dil kodu formatı (2 karakter)
        RuleFor(x => x.DefaultLanguage)
            .Length(2).WithMessage("Dil kodu 2 karakter olmalıdır (örn: TR, EN)")
            .Matches("^[A-Z]{2}$").WithMessage("Dil kodu büyük harf olmalıdır");
    }
}

