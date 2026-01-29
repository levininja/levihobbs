using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.Json;
using levihobbs.Models;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Google.Api.Gax.ResourceNames;
using Google.Cloud.RecaptchaEnterprise.V1;

namespace levihobbs.Services;

public interface IReCaptchaService
{
    Task<bool> VerifyResponseAsync(string response);
    Task<bool> VerifyV3TokenAsync(string token, string action);
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

    public async Task<bool> VerifyV3TokenAsync(string token, string action)
    {
        return await CreateAssessmentAsync(token, action);
    }

    // Create an assessment to analyze the risk of a UI action.
    // Uses ReCaptcha Enterprise API. Project ID, site key, etc. come from config or defaults.
    private async Task<bool> CreateAssessmentAsync(string token, string recaptchaAction)
    {
        string projectId = "levihobbs-develo-1748119893067";
        string siteKey = _settings.SiteKey;
        if (string.IsNullOrEmpty(siteKey))
            siteKey = "6LdcI1ksAAAAAGY5uCGXIsooV6dwk0oavhvwrtWs";

        try
        {
            RecaptchaEnterpriseServiceClient client = RecaptchaEnterpriseServiceClient.Create();
            ProjectName projectName = new ProjectName(projectId);

            CreateAssessmentRequest createAssessmentRequest = new CreateAssessmentRequest
            {
                Assessment = new Assessment
                {
                    Event = new Event
                    {
                        SiteKey = siteKey,
                        Token = token,
                        ExpectedAction = recaptchaAction
                    }
                },
                ParentAsProjectName = projectName
            };

            Assessment response = await Task.Run(() => client.CreateAssessment(createAssessmentRequest));

            if (response.TokenProperties.Valid == false)
            {
                _logger.LogWarning("reCAPTCHA assessment failed: {Reason}", response.TokenProperties.InvalidReason);
                return false;
            }

            if (response.TokenProperties.Action != recaptchaAction)
            {
                _logger.LogWarning("reCAPTCHA action mismatch: expected {Expected}, got {Actual}", recaptchaAction, response.TokenProperties.Action);
                return false;
            }

            _logger.LogInformation("reCAPTCHA score: {Score}", (decimal)response.RiskAnalysis.Score);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "reCAPTCHA Enterprise assessment failed");
            return false;
        }
    }
}
