using FluentValidation;

namespace AccountOS.Application.Companies.Commands.InviteUser;

/// <summary>
/// Kullanıcı davet komutu doğrulayıcısı
/// </summary>
public class InviteUserToCompanyCommandValidator : AbstractValidator<InviteUserToCompanyCommand>
{
    public InviteUserToCompanyCommandValidator()
    {
        RuleFor(x => x.CompanyId)
            .NotEmpty().WithMessage("Şirket ID gereklidir");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email adresi gereklidir")
            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Rol gereklidir")
            .Must(role => new[] { "Admin", "Manager", "Accountant", "Salesperson", "User" }.Contains(role))
            .WithMessage("Geçersiz rol. Geçerli roller: Admin, Manager, Accountant, Salesperson, User");
    }
}

