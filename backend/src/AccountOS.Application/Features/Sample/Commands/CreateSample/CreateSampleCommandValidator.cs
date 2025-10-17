using FluentValidation;

namespace AccountOS.Application.Features.Sample.Commands.CreateSample;

/// <summary>
/// CreateSampleCommand Validator
/// FluentValidation kullanır
/// ValidationBehavior tarafından otomatik çalıştırılır
/// </summary>
public class CreateSampleCommandValidator : AbstractValidator<CreateSampleCommand>
{
    public CreateSampleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("İsim boş olamaz")
            .MaximumLength(200).WithMessage("İsim en fazla 200 karakter olabilir");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir");
    }
}

