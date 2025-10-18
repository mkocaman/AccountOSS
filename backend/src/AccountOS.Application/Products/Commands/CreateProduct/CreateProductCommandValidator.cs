using FluentValidation;

namespace AccountOS.Application.Products.Commands.CreateProduct;

/// <summary>
/// Ürün oluşturma doğrulayıcısı
/// </summary>
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Ürün adı gereklidir")
            .MaximumLength(200).WithMessage("Ürün adı en fazla 200 karakter olabilir");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi gereklidir")
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır (örn: TRY, USD)")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır");

        RuleFor(x => x.PurchasePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Alış fiyatı 0 veya daha büyük olmalıdır");

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0).WithMessage("Satış fiyatı 0 veya daha büyük olmalıdır");

        RuleFor(x => x.VatRate)
            .GreaterThanOrEqualTo(0).WithMessage("KDV oranı 0 veya daha büyük olmalıdır")
            .LessThanOrEqualTo(100).WithMessage("KDV oranı en fazla 100 olabilir");

        RuleFor(x => x.Unit)
            .NotEmpty().WithMessage("Birim gereklidir")
            .MaximumLength(50).WithMessage("Birim en fazla 50 karakter olabilir");

        RuleFor(x => x.MinStockLevel)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum stok seviyesi 0 veya daha büyük olmalıdır");

        // Çeviri validasyonu
        RuleForEach(x => x.Translations)
            .ChildRules(translation =>
            {
                translation.RuleFor(t => t.LanguageCode)
                    .NotEmpty().WithMessage("Dil kodu gereklidir")
                    .Length(2).WithMessage("Dil kodu 2 karakter olmalıdır")
                    .Matches("^[A-Z]{2}$").WithMessage("Dil kodu büyük harf olmalıdır");

                translation.RuleFor(t => t.Name)
                    .NotEmpty().WithMessage("Çeviri için ürün adı gereklidir")
                    .MaximumLength(200).WithMessage("Ürün adı en fazla 200 karakter olabilir");
            })
            .When(x => x.Translations != null && x.Translations.Any());
    }
}

