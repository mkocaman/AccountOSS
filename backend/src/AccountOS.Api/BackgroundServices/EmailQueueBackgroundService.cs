using AccountOS.Application.Common.Interfaces;

namespace AccountOS.Api.BackgroundServices;

/// <summary>
/// Email kuyruğunu işleyen arka plan servisi
/// </summary>
public class EmailQueueBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailQueueBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(5);

    public EmailQueueBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<EmailQueueBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Queue Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

                await emailService.ProcessEmailQueueAsync(stoppingToken);

                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Service is stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing email queue");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        _logger.LogInformation("Email Queue Background Service stopped");
    }
}

