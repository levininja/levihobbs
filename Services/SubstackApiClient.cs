using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using levihobbs.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using levihobbs.Data;
using Polly;
using Polly.Retry;

namespace levihobbs.Services
{
    /// <summary>
    /// Client for interacting with the Substack API to fetch story content.
    /// This service handles the communication with Substack's API endpoints and
    /// transforms the response into our application's data models.
    /// </summary>
    public class SubstackApiClient : ISubstackApiClient
    {
        private readonly string _url = "https://levihobbs.substack.com";
        private readonly HttpClient _httpClient;
        private readonly ILogger<SubstackApiClient> _logger;
        private readonly IMemoryCache _cache;
        private readonly ApplicationDbContext _context;
        private static readonly TimeSpan _cacheDuration = TimeSpan.FromDays(1);

        public SubstackApiClient(HttpClient httpClient, ILogger<SubstackApiClient> logger, IMemoryCache cache, ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _logger = logger;
            _cache = cache;
            _context = context;
        }

        /// <summary>
        /// Searches for posts on Substack with pagination support.
        /// </summary>
        /// <param name="searchTerm">The search term to filter posts by.</param>
        /// <param name="limit">Maximum number of posts to return (default: 20).</param>
        /// <returns>A list of StoryDTO objects containing the story data from Substack.</returns>
        public async Task<List<StoryDTO>> GetStories(string searchTerm, int? limit = 20)
        {
            string cacheKey = $"stories_{searchTerm}_{limit}";
            
            if (_cache.TryGetValue(cacheKey, out List<StoryDTO>? cachedStories))
            {
                _logger.LogInformation("Cache HIT for key: {CacheKey} with {Count} stories", cacheKey, cachedStories?.Count ?? 0);
                return cachedStories;
            }

            _logger.LogInformation("Cache MISS for key: {CacheKey}, fetching from Substack API", cacheKey);

            Dictionary<string, string> paramsDict = new Dictionary<string, string>
            {
                { "sort", "new" }
            };

            List<JsonElement> postData = await FetchPaginatedPostsAsync(paramsDict, limit);
            List<StoryDTO> stories = new List<StoryDTO>();

            foreach (JsonElement item in postData)
            {
                string? seoDescription = item.GetProperty("search_engine_description").GetString();
                if(seoDescription != null && seoDescription.Contains(searchTerm, StringComparison.OrdinalIgnoreCase))
                {
                    string? canonicalUrl = item.GetProperty("canonical_url").GetString();
                    StoryDTO story = new StoryDTO
                    {
                        Title = item.GetProperty("title").GetString() ?? string.Empty,
                        Subtitle = item.GetProperty("subtitle").GetString() ?? string.Empty,
                        SearchEngineDescription = item.GetProperty("search_engine_description").GetString() ?? string.Empty,
                        Description = item.GetProperty("description").GetString() ?? string.Empty,
                        CoverImage = item.GetProperty("cover_image").GetString() ?? string.Empty,
                        CanonicalUrl = canonicalUrl ?? string.Empty,
                        Id = Math.Abs((canonicalUrl ?? string.Empty).GetHashCode()).ToString(),
                        PostDate = DateTime.UtcNow
                    };
                    stories.Add(story);
                }
            }

            _cache.Set(cacheKey, stories, _cacheDuration);
            
            return stories;
        }

        /// <summary>
        /// Fetches posts from Substack with pagination support.
        /// This method handles the complexity of paginated API requests, making multiple
        /// requests as needed to fetch all requested data while respecting rate limits.
        /// </summary>
        /// <param name="paramsDict">Dictionary of query parameters for the API request.</param>
        /// <param name="limit">Optional limit on the total number of posts to fetch.</param>
        /// <param name="pageSize">Number of posts to fetch per request (default: 15).</param>
        /// <returns>A list of JsonElement objects containing the raw post data.</returns>
        private async Task<List<JsonElement>> FetchPaginatedPostsAsync(Dictionary<string, string> paramsDict, int? limit = null, int pageSize = 15)
        {
            List<JsonElement> results = new List<JsonElement>();
            int offset = 0;
            int batchSize = pageSize;
            bool moreItems = true;

            while (moreItems)
            {
                Dictionary<string, string> currentParams = new Dictionary<string, string>(paramsDict)
                {
                    { "offset", offset.ToString() },
                    { "limit", batchSize.ToString() }
                };

                string queryString = string.Join("&", currentParams.Select(kv => $"{kv.Key}={kv.Value}"));
                string endpoint = $"{_url}/api/v1/archive?{queryString}";

                HttpResponseMessage response = await _httpClient.GetAsync(endpoint);
                if (!response.IsSuccessStatusCode)
                {
                    break;
                }

                string jsonString = await response.Content.ReadAsStringAsync();
                List<JsonElement>? items = JsonSerializer.Deserialize<List<JsonElement>>(jsonString);

                if (items == null || items.Count == 0)
                {
                    break;
                }

                results.AddRange(items);
                offset += batchSize;

                // Stop if we've reached the requested limit
                if (limit.HasValue && results.Count >= limit.Value)
                {
                    results = results.Take(limit.Value).ToList();
                    moreItems = false;
                }

                // Stop if we've received fewer items than requested (which usually happens on the last page of results)
                if (items.Count < batchSize)
                {
                    moreItems = false;
                }

                // Be nice to the API so it doesn't flag us as a bot
                await Task.Delay(500);
            }

            return results;
        }

        /// <summary>
        /// Subscribes a user to the Substack newsletter with retry logic
        /// </summary>
        /// <param name="email">The email address to subscribe</param>
        /// <returns>True if subscription was successful, false otherwise</returns>
        public async Task<bool> SubscribeToNewsletterAsync(string email)
        {
            // Create retry policy with exponential backoff
            var retryPolicy = Policy
                .Handle<HttpRequestException>()
                .Or<TaskCanceledException>()
                .Or<JsonException>()
                .WaitAndRetryAsync(
                    3, // Retry 3 times
                    retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // Exponential backoff: 2, 4, 8 seconds
                    (exception, timeSpan, retryCount, context) =>
                    {
                        _logger.LogWarning(
                            "Attempt {RetryCount} to subscribe {Email} failed with {ExceptionType}: {ExceptionMessage}. Retrying in {TimeSpan}s",
                            retryCount, email, exception.GetType().Name, exception.Message, timeSpan.TotalSeconds);
                    }
                );

            try
            {
                return await retryPolicy.ExecuteAsync(async () =>
                {
                    // Prepare the subscription data
                    var subscriptionData = new Dictionary<string, string>
                    {
                        { "email", email },
                        { "source", "subscribe_page" }
                    };

                    var content = new FormUrlEncodedContent(subscriptionData);
                    _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");

                    // Make the API call to Substack
                    var response = await _httpClient.PostAsync($"{_url}/api/v1/free?nojs=true", content);
                    
                    // Check if the request was successful
                    if (response.IsSuccessStatusCode)
                    {
                        return true;
                    }
                    
                    // Log the error response
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to subscribe {Email} to Substack. Status: {StatusCode}, Response: {Response}", 
                        email, response.StatusCode, errorContent);
                    
                    // If we get here, the request failed but didn't throw an exception
                    // We'll still retry based on status code
                    response.EnsureSuccessStatusCode(); // This will throw and trigger retry
                    return false; // This line won't be reached if EnsureSuccessStatusCode throws
                });
            }
            catch (Exception ex)
            {
                // Log the error to the database
                var errorLog = new ErrorLog
                {
                    LogLevel = "Error",
                    Message = $"Failed to subscribe {email} to Substack newsletter after 3 attempts: {ex.Message}",
                    Source = "SubstackApiClient.SubscribeToNewsletterAsync",
                    StackTrace = ex.StackTrace?.Substring(0, Math.Min(ex.StackTrace.Length, 1024)) ?? string.Empty,
                    LogDate = DateTime.UtcNow
                };
                
                _context.ErrorLogs.Add(errorLog);
                await _context.SaveChangesAsync();
                
                _logger.LogError(ex, "Failed to subscribe {Email} to Substack newsletter after 3 attempts", email);
                return false;
            }
        }
    }
}