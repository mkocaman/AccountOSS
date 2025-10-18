using FluentValidation;

namespace AccountOS.Application.Stock.Commands.AddStock;

/// <summary>
/// Stok ekleme doğrulayıcısı
/// </summary>
public class AddStockCommandValidator : AbstractValidator<AddStockCommand>
{
    public AddStockCommandValidator()
    {
        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Ürün ID gereklidir");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır");

        RuleFor(x => x.UnitCost)
            .GreaterThanOrEqualTo(0).WithMessage("Birim maliyet 0 veya daha büyük olmalıdır");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi gereklidir")
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır");

        RuleFor(x => x.ReferenceType)
            .NotEmpty().WithMessage("Referans tipi gereklidir")
            .Must(type => new[] { "Purchase", "Return", "Adjustment" }.Contains(type))
            .WithMessage("Referans tipi Purchase, Return veya Adjustment olmalıdır");
    }
}

