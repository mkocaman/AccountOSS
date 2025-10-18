namespace AccountOS.Application.Email.Configuration.Common;

public record EmailConfigurationDto
{
    public Guid Id { get; init; }
    public Guid CompanyId { get; init; }
    public string SmtpHost { get; init; } = string.Empty;
    public int SmtpPort { get; init; }
    public bool UseSsl { get; init; }
    public string Username { get; init; } = string.Empty;
    public string SenderName { get; init; } = string.Empty;
    public string SenderEmail { get; init; } = string.Empty;
    public string? DefaultCc { get; init; }
    public string? DefaultBcc { get; init; }
    public bool IsActive { get; init; }
    public bool IsTested { get; init; }
    public DateTime? LastTestedAt { get; init; }
}

