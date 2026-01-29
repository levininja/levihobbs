using System.Text.Json.Serialization;

namespace levihobbs.Models;

internal class ReCaptchaVerifyResponse
{
    [JsonPropertyName("success")]
    public bool Success { get; set; }

    [JsonPropertyName("error-codes")]
    public string[]? ErrorCodes { get; set; }
}
