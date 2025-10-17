using FluentValidation;
using MediatR;
using AccountOS.Application.Common.Exceptions;

namespace AccountOS.Application.Common.Behaviors;

/// <summary>
/// MediatR pipeline behavior - Validation
/// Tüm Command ve Query'lere otomatik validation uygular
/// FluentValidation kullanır
/// </summary>
public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // Eğer validator yoksa, direk devam et
        if (!_validators.Any())
        {
            return await next();
        }

        // Validation context oluştur
        var context = new ValidationContext<TRequest>(request);

        // Tüm validator'ları çalıştır
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        // Hataları topla
        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        // Hata varsa exception fırlat
        if (failures.Any())
        {
            throw new Exceptions.ValidationException(failures);
        }

        // Validation başarılı, devam et
        return await next();
    }
}

