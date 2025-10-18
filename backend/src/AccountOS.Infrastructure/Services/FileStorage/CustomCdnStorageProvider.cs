using AccountOS.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace AccountOS.Infrastructure.Services.FileStorage;

/// <summary>
/// Custom CDN storage provider (HTTP-based)
/// </summary>
public class CustomCdnStorageProvider : IFileStorageService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<CustomCdnStorageProvider> _logger;

    public CustomCdnStorageProvider(
        IHttpClientFactory httpClientFactory,
        ILogger<CustomCdnStorageProvider> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        Dictionary<string, string>? metadata = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (metadata == null || !metadata.ContainsKey("BaseUrl"))
            {
                throw new ArgumentException("CDN configuration missing");
            }

            var baseUrl = metadata["BaseUrl"];
            var apiKey = metadata.GetValueOrDefault("ApiKey");
            var uploadEndpoint = metadata.GetValueOrDefault("UploadEndpoint", "/upload");

            var httpClient = _httpClientFactory.CreateClient();
            
            using var content = new MultipartFormDataContent();
            using var streamContent = new StreamContent(fileStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);
            content.Add(streamContent, "file", fileName);

            if (!string.IsNullOrWhiteSpace(apiKey))
            {
                httpClient.DefaultRequestHeaders.Add("X-API-Key", apiKey);
            }

            var response = await httpClient.PostAsync($"{baseUrl}{uploadEndpoint}", content, cancellationToken);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadAsStringAsync(cancellationToken);
            var json = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(result);
            var filePath = json?["filePath"].GetString() ?? fileName;

            _logger.LogInformation("File uploaded to CDN: {FileName}", fileName);

            return filePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to CDN: {FileName}", fileName);
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // CDN'den dosya indirme - basit HTTP GET
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync(filePath, cancellationToken);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStreamAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from CDN: {FilePath}", filePath);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // CDN'den dosya silme - HTTP DELETE
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.DeleteAsync(filePath, cancellationToken);
            
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from CDN: {FilePath}", filePath);
            return false;
        }
    }

    public async Task<bool> FileExistsAsync(
        string filePath,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.SendAsync(
                new HttpRequestMessage(HttpMethod.Head, filePath),
                cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<string?> GetPublicUrlAsync(
        string filePath,
        TimeSpan? expiresIn = null,
        CancellationToken cancellationToken = default)
    {
        // CDN files are usually public
        return filePath;
    }

    public async Task<bool> TestConnectionAsync(
        string configuration,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = JsonSerializer.Deserialize<Dictionary<string, string>>(configuration);
            var baseUrl = config?.GetValueOrDefault("BaseUrl");

            if (string.IsNullOrWhiteSpace(baseUrl))
                return false;

            var httpClient = _httpClientFactory.CreateClient();
            var response = await httpClient.GetAsync($"{baseUrl}/health", cancellationToken);

            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}

