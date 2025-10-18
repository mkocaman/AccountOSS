using FluentValidation;

namespace AccountOS.Application.Products.Commands.UpdateProduct;

/// <summary>
/// Ürün güncelleme doğrulayıcısı
/// </summary>
public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Ürün ID gereklidir");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Ürün adı gereklidir")
            .MaximumLength(200).WithMessage("Ürün adı en fazla 200 karakter olabilir");

        RuleFor(x => x.Currency)
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır")
            .When(x => !string.IsNullOrWhiteSpace(x.Currency));

        RuleFor(x => x.PurchasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Alış fiyatı 0 veya daha büyük olmalıdır");

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Satış fiyatı 0 veya daha büyük olmalıdır");

        RuleFor(x => x.VatRate)
            .GreaterThanOrEqualTo(0).WithMessage("KDV oranı 0 veya daha büyük olmalıdır")
            .LessThanOrEqualTo(100).WithMessage("KDV oranı en fazla 100 olabilir");

        RuleFor(x => x.MinStockLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum stok seviyesi 0 veya daha büyük olmalıdır");
    }
}

