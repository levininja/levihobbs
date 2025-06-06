using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using levihobbs.Models;
using System.Text.Json.Serialization;

namespace levihobbs.Services;

public interface IReCaptchaService
{
    Task<bool> VerifyResponseAsync(string response);
}

public class ReCaptchaService : IReCaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly ReCaptchaSettings _settings;
    private readonly ILogger<ReCaptchaService> _logger;
    private const string VerifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    public ReCaptchaService(HttpClient httpClient, IOptions<ReCaptchaSettings> settings, ILogger<ReCaptchaService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> VerifyResponseAsync(string response)
    {
        if (string.IsNullOrEmpty(response))
        {
            _logger.LogWarning("Empty reCAPTCHA response received");
            return false;
        }

        FormUrlEncodedContent content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("secret", _settings.SecretKey),
            new KeyValuePair<string, string>("response", response)
        });

        HttpResponseMessage verifyResponse = await _httpClient.PostAsync(VerifyUrl, content);
        string responseString = await verifyResponse.Content.ReadAsStringAsync();

        ReCaptchaVerifyResponse? responseData = JsonSerializer.Deserialize<ReCaptchaVerifyResponse>(responseString);
        
        if (responseData?.Success == false && responseData.ErrorCodes?.Length > 0)
        {
            _logger.LogWarning("reCAPTCHA verification failed. Error codes: {ErrorCodes}", 
                string.Join(", ", responseData.ErrorCodes));
            return false;
        }
        else if (responseData?.Success == true)
        {
            return true;
        }

        return false;
    }
}

public class ReCaptchaVerifyResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("challenge_ts")]
    public string ChallengeTs { get; set; } = string.Empty;

    [JsonPropertyName("hostname")]
    public string Hostname { get; set; } = string.Empty;

    [JsonPropertyName("error-codes")]
    public string[] ErrorCodes { get; set; } = Array.Empty<string>();
} 