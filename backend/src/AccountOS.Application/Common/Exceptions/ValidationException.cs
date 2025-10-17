using FluentValidation.Results;

namespace AccountOS.Application.Common.Exceptions;

/// <summary>
/// FluentValidation hatalarını taşır
/// HTTP 400 dönülmesi gereken durumlar için
/// </summary>
public class ValidationException : Exception
{
    public ValidationException()
        : base("Bir veya daha fazla validation hatası oluştu")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<ValidationFailure> failures)
        : this()
    {
        Errors = failures
            .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
            .ToDictionary(failureGroup => failureGroup.Key, failureGroup => failureGroup.ToArray());
    }

    public IDictionary<string, string[]> Errors { get; }
}

