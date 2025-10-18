using FluentValidation;

namespace AccountOS.Application.Stock.Commands.RemoveStock;

/// <summary>
/// Stok çıkarma doğrulayıcısı
/// </summary>
public class RemoveStockCommandValidator : AbstractValidator<RemoveStockCommand>
{
    public RemoveStockCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Ürün ID gereklidir");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır");

        RuleFor(x => x.ReferenceType)
            .NotEmpty().WithMessage("Referans tipi gereklidir")
            .Must(type => new[] { "Sales", "Transfer" }.Contains(type))
            .WithMessage("Referans tipi Sales veya Transfer olmalıdır");
    }
}

