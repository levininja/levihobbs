using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text;

namespace levihobbs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookToneRecommendationsProxyController : ControllerBase
    {
        private readonly ILogger<BookToneRecommendationsProxyController> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _bookToneApiUrl;
        private readonly string _bookDataApiUrl;
        
        public BookToneRecommendationsProxyController(
            ILogger<BookToneRecommendationsProxyController> logger,
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _logger = logger;
            _httpClient = httpClient;
            _configuration = configuration;
            _bookToneApiUrl = _configuration["BookToneApi:BaseUrl"] ?? "http://localhost:5010";
            _bookDataApiUrl = _configuration["BookDataApi:BaseUrl"] ?? "http://localhost:5020";
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            _logger.LogInformation("Test endpoint hit!");
            return Ok(new { message = "BookToneRecommendationsProxy controller is working!", timestamp = DateTime.UtcNow });
        }

        [HttpPost("")]
        public async Task<IActionResult> ProcessBooks([FromQuery] List<int> bookIds)
        {
            _logger.LogInformation("ProcessBooks endpoint hit! BookIds: {BookIds}", bookIds != null ? string.Join(", ", bookIds) : "null");
            
            try
            {
                if (bookIds == null || !bookIds.Any())
                    return BadRequest(new { message = "No book IDs provided" });

                _logger.LogInformation("Processing {Count} books for AI tone recommendations: {BookIds}", 
                    bookIds.Count, string.Join(", ", bookIds));

                var bookIdsParam = string.Join("&", bookIds.Select(id => $"bookIds={id}"));
                var targetUrl = $"{_bookToneApiUrl}/api/book-tone-recommendations?{bookIdsParam}";
                
                _logger.LogInformation("Forwarding request to: {TargetUrl}", targetUrl);
                
                var response = await _httpClient.PostAsync(targetUrl, null);
                
                _logger.LogInformation("Response from BookToneApi: StatusCode={StatusCode}", response.StatusCode);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }
                
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("BookToneApi returned error: StatusCode={StatusCode}, Content={Content}", response.StatusCode, errorContent);
                return StatusCode((int)response.StatusCode, errorContent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing books for tone recommendations");
                return StatusCode(500, new { message = "An error occurred while processing books for tone recommendations" });
            }
        }

        [HttpGet("batch/{batchId}/status")]
        public async Task<IActionResult> GetBatchStatus(string batchId)
        {
            try
            {
                if (string.IsNullOrEmpty(batchId))
                    return BadRequest(new { message = "Batch ID is required" });

                _logger.LogInformation("Checking status for batch {BatchId}", batchId);

                var response = await _httpClient.GetAsync($"{_bookToneApiUrl}/api/book-tone-recommendations/batch/{batchId}/status");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }
                
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting batch status for {BatchId}", batchId);
                return StatusCode(500, new { message = "An error occurred while getting batch status" });
            }
        }

        [HttpGet("{bookId}")]
        public async Task<IActionResult> GetBookRecommendations(int bookId)
        {
            try
            {
                _logger.LogInformation("Getting tone recommendations for book {BookId}", bookId);

                var response = await _httpClient.GetAsync($"{_bookDataApiUrl}/api/book-tone-recommendations/book/{bookId}");
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    return Content(content, "application/json");
                }
                
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendations for book {BookId}", bookId);
                return StatusCode(500, new { message = "An error occurred while getting book recommendations" });
            }
        }

        [HttpPut("{recommendationId}")]
        public async Task<IActionResult> UpdateRecommendationFeedback(int recommendationId, [FromBody] object feedbackData)
        {
            try
            {
                _logger.LogInformation("Updating feedback for recommendation {RecommendationId}", recommendationId);

                var json = System.Text.Json.JsonSerializer.Serialize(feedbackData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PutAsync($"{_bookDataApiUrl}/api/book-tone-recommendations/{recommendationId}", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    return Content(responseContent, "application/json");
                }
                
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating feedback for recommendation {RecommendationId}", recommendationId);
                return StatusCode(500, new { message = "An error occurred while updating recommendation feedback" });
            }
        }
    }
} 