namespace levihobbs.Models;

public class ReCaptchaSettings
{
    public string SiteKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// Optional. Google Cloud API key for reCAPTCHA Enterprise REST API.
    /// When set, assessments are created via REST (no Application Default Credentials needed).
    /// When unset, the client library is used (requires ADC, e.g. GOOGLE_APPLICATION_CREDENTIALS or gcloud auth).
    /// </summary>
    public string? GoogleCloudApiKey { get; set; }

    /// <summary>
    /// Optional. Google Cloud project ID for reCAPTCHA Enterprise. Used with GoogleCloudApiKey for REST assessments.
    /// </summary>
    public string? ProjectId { get; set; }
} 