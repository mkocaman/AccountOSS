using AccountOS.Application.Common;
using AccountOS.Application.Email.Configuration.Common;
using MediatR;

namespace AccountOS.Application.Email.Configuration.Commands.SaveEmailConfiguration;

/// <summary>
/// Email yapılandırması kaydet/güncelle
/// </summary>
public record SaveEmailConfigurationCommand : IRequest<Result<EmailConfigurationDto>>
{
    public Guid? Id { get; init; }
    public string SmtpHost { get; init; } = string.Empty;
    public int SmtpPort { get; init; }
    public bool UseSsl { get; init; } = true;
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public string SenderEmail { get; init; } = string.Empty;
    public string? DefaultCc { get; init; }
    public string? DefaultBcc { get; init; }
}

