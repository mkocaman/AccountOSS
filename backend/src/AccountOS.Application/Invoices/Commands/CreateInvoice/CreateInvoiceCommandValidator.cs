using AccountOS.Domain.Enums;
using FluentValidation;

namespace AccountOS.Application.Invoices.Commands.CreateInvoice;

/// <summary>
/// Fatura oluşturma doğrulayıcısı
/// </summary>
public class CreateInvoiceCommandValidator : AbstractValidator<CreateInvoiceCommand>
{
    public CreateInvoiceCommandValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Cari hesap seçimi zorunludur");

        RuleFor(x => x.InvoiceDate)
            .NotEmpty().WithMessage("Fatura tarihi gereklidir")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("Fatura tarihi gelecek olamaz");

        RuleFor(x => x.DueDate)
            .GreaterThanOrEqualTo(x => x.InvoiceDate).WithMessage("Vade tarihi fatura tarihinden önce olamaz")
            .When(x => x.DueDate.HasValue);

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi gereklidir")
            .Length(3).WithMessage("Para birimi 3 karakter olmalıdır")
            .Matches("^[A-Z]{3}$").WithMessage("Para birimi büyük harf olmalıdır");

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("Fatura en az 1 kalem içermelidir")
            .Must(items => items != null && items.Count > 0).WithMessage("Fatura en az 1 kalem içermelidir");

        RuleForEach(x => x.Items)
            .ChildRules(item =>
            {
                item.RuleFor(i => i.ProductId)
                    .NotEmpty().WithMessage("Ürün seçimi zorunludur");

                item.RuleFor(i => i.Quantity)
                    .GreaterThan(0).WithMessage("Miktar 0'dan büyük olmalıdır");

                item.RuleFor(i => i.UnitPrice)
                    .GreaterThanOrEqualTo(0).WithMessage("Birim fiyat 0 veya daha büyük olmalıdır");

                item.RuleFor(i => i.DiscountPercentage)
                    .GreaterThanOrEqualTo(0).WithMessage("İndirim oranı 0 veya daha büyük olmalıdır")
                    .LessThanOrEqualTo(100).WithMessage("İndirim oranı en fazla 100 olabilir");
            });
    }
}
