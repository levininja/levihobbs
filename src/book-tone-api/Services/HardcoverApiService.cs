using System.Text.Json;
using System.Net.Http;

namespace BookToneApi.Services
{
    // NOTE: THIS IS NOT USED IN THE CURRENT IMPLEMENTATION
    public class HardcoverApiService : IHardcoverApiService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<HardcoverApiService> _logger;
        private readonly string _bearerToken;
        private readonly string _graphqlEndpoint = "https://api.hardcover.app/v1/graphql";

        public HardcoverApiService(ILogger<HardcoverApiService> logger, HttpClient httpClient, IConfiguration configuration)
        {
            _logger = logger;
            _httpClient = httpClient;
            _bearerToken = configuration["HardcoverBearerToken"] ?? string.Empty;
            
            // Set a reasonable timeout for Hardcover API calls (15 seconds)
            _httpClient.Timeout = TimeSpan.FromSeconds(15);
        }

        public async Task<List<string>> GetMoodTagsAsync(string bookTitle, string bookAuthor)
        {
            _logger.LogInformation("GetMoodTagsAsync: Starting for '{BookTitle}' by {BookAuthor}", bookTitle, bookAuthor);
            
            try
            {
                if (string.IsNullOrEmpty(_bearerToken))
                {
                    _logger.LogWarning("GetMoodTagsAsync: Hardcover Bearer Token not configured. Skipping mood tag retrieval.");
                    return new List<string>();
                }

                _logger.LogInformation("GetMoodTagsAsync: Bearer token configured, proceeding with API call");
                
                // Search for the book and get mood tags in one query
                List<string> moodTags = await SearchBookAndGetMoodTagsAsync(bookTitle, bookAuthor);
                _logger.LogInformation("GetMoodTagsAsync: Completed with {MoodTagCount} mood tags", moodTags.Count);
                return moodTags;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "GetMoodTagsAsync: Error retrieving mood tags for {Title} by {Author}", bookTitle, bookAuthor);
                return new List<string>();
            }
        }

        private async Task<List<string>> SearchBookAndGetMoodTagsAsync(string bookTitle, string bookAuthor)
        {
            _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Starting for '{BookTitle}' by {BookAuthor}", bookTitle, bookAuthor);
            
            try
            {
                string query = @"
                query SearchBooksWithMoodTags($title: String!) {
                    books(
                        limit: 5
                        where: { title: { _eq: $title } }
                        order_by: { release_year: asc }
                    ) {
                        id
                        title
                        subtitle
                        description
                        cached_contributors
                        taggable_counts {
                            tag {
                                tag
                                id
                                count
                                tag_category_id
                            }
                        }
                    }
                }";

                object variables = new
                {
                    title = bookTitle
                };

                object request = new
                {
                    query,
                    variables
                };

                _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Making GraphQL request with title: {Title}", bookTitle);
                JsonElement? response = await MakeGraphQLRequestAsync(request);
                if (response == null) 
                {
                    _logger.LogWarning("SearchBookAndGetMoodTagsAsync: No response from GraphQL API");
                    return new List<string>();
                }

                _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Received GraphQL response, processing books");
                List<string> moodTags = new List<string>();
                
                // Add defensive parsing to handle potential missing properties
                if (!response.Value.TryGetProperty("data", out var dataElement))
                {
                    _logger.LogWarning("SearchBookAndGetMoodTagsAsync: No 'data' property found in response");
                    return new List<string>();
                }
                
                if (!dataElement.TryGetProperty("books", out var books))
                {
                    _logger.LogWarning("SearchBookAndGetMoodTagsAsync: No 'books' property found in data");
                    return new List<string>();
                }
                
                int bookCount = books.GetArrayLength();
                _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Found {BookCount} books in response", bookCount);

                foreach (JsonElement book in books.EnumerateArray())
                {
                    // Add defensive parsing for book properties
                    if (!book.TryGetProperty("title", out var titleElement) || 
                        !book.TryGetProperty("cached_contributors", out var contributorsElement))
                    {
                        _logger.LogDebug("SearchBookAndGetMoodTagsAsync: Skipping book with missing title or contributors");
                        continue;
                    }
                    
                    string? title = titleElement.GetString()?.ToLower();
                    
                    // Parse cached_contributors array to extract author names
                    List<string> authorNames = new List<string>();
                    if (contributorsElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (JsonElement contributor in contributorsElement.EnumerateArray())
                        {
                            if (contributor.TryGetProperty("author", out var authorElement) &&
                                authorElement.TryGetProperty("name", out var nameElement))
                            {
                                string? authorName = nameElement.GetString();
                                if (!string.IsNullOrEmpty(authorName))
                                {
                                    authorNames.Add(authorName.ToLower());
                                }
                            }
                        }
                    }
                    
                    string contributorsString = string.Join(", ", authorNames);
                    _logger.LogDebug("SearchBookAndGetMoodTagsAsync: Checking book '{Title}' with contributors: {Contributors}", 
                        title, contributorsString);

                    // Check if this book matches our search criteria
                    if (title?.Contains(bookTitle.ToLower()) == true && 
                        authorNames.Any(name => name.Contains(bookAuthor.ToLower())))
                    {
                        _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Found matching book '{Title}'", title);
                        
                        // Extract mood tags from this book
                        if (!book.TryGetProperty("taggable_counts", out var taggableCounts))
                        {
                            _logger.LogDebug("SearchBookAndGetMoodTagsAsync: Book has no taggable_counts property");
                            continue;
                        }
                        
                        int taggingCount = taggableCounts.GetArrayLength();
                        _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Book has {TaggingCount} taggable_counts", taggingCount);
                        
                        // Create a list to store mood tags with their counts
                        List<(string tagName, int count)> moodTagCounts = new List<(string tagName, int count)>();
                        
                        foreach (JsonElement taggableCount in taggableCounts.EnumerateArray())
                        {
                            if (!taggableCount.TryGetProperty("tag", out var tag))
                            {
                                _logger.LogDebug("SearchBookAndGetMoodTagsAsync: TaggableCount has no tag property");
                                continue;
                            }
                            
                            if (!tag.TryGetProperty("tag", out var tagNameElement) || 
                                !tag.TryGetProperty("tag_category_id", out var categoryIdElement) ||
                                !tag.TryGetProperty("count", out var countElement))
                            {
                                _logger.LogDebug("SearchBookAndGetMoodTagsAsync: Tag missing required properties");
                                continue;
                            }
                            
                            string? tagName = tagNameElement.GetString();
                            int categoryId = categoryIdElement.GetInt32();
                            int count = countElement.GetInt32();

                            _logger.LogDebug("SearchBookAndGetMoodTagsAsync: Found tag '{TagName}' with category {CategoryId} and count {Count}", 
                                tagName, categoryId, count);

                            // Category 4 is mood tags
                            if (categoryId == 4 && !string.IsNullOrEmpty(tagName))
                            {
                                moodTagCounts.Add((tagName, count));
                                _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Added mood tag '{TagName}' with count {Count}", tagName, count);
                            }
                        }
                        
                        // Order by count (descending) first
                        List<(string tagName, int count)> orderedMoodTags = moodTagCounts.OrderByDescending(x => x.count).ToList();
                        
                        if (orderedMoodTags.Count > 0)
                        {
                            // Calculate threshold: average of top 3 counts divided by 10
                            List<int> top3Counts = orderedMoodTags.Take(3).Select(x => x.count).ToList();
                            double averageTop3 = top3Counts.Average();
                            double threshold = averageTop3 / 10;
                            
                            _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Top 3 counts: {Top3Counts}, Average: {Average}, Threshold: {Threshold}", 
                                string.Join(", ", top3Counts), averageTop3, threshold);
                            
                            // Filter out mood tags below the threshold
                            moodTags = orderedMoodTags
                                .Where(x => x.count >= threshold)
                                .Take(15) // Still limit to top 15
                                .Select(x => x.tagName)
                                .ToList();
                            
                            _logger.LogInformation("SearchBookAndGetMoodTagsAsync: After filtering, kept {MoodTagCount} mood tags above threshold {Threshold}", 
                                moodTags.Count, threshold);
                        }
                        else
                        {
                            moodTags = new List<string>();
                        }

                        // If we found a match, return the mood tags
                        if (moodTags.Count > 0)
                        {
                            _logger.LogInformation("SearchBookAndGetMoodTagsAsync: Found {MoodTagCount} mood tags for '{Title}' by {Author}: {MoodTags}", 
                                moodTags.Count, bookTitle, bookAuthor, string.Join(", ", moodTags));
                            return moodTags;
                        }
                    }
                }

                _logger.LogWarning("SearchBookAndGetMoodTagsAsync: Book not found in Hardcover or no mood tags available: {Title} by {Author}", 
                    bookTitle, bookAuthor);
                return new List<string>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SearchBookAndGetMoodTagsAsync: Error searching for book and mood tags: {Title} by {Author}", bookTitle, bookAuthor);
                return new List<string>();
            }
        }

        private async Task<JsonElement?> MakeGraphQLRequestAsync(object request)
        {
            try
            {
                string json = JsonSerializer.Serialize(request);
                StringContent content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                // Check if the token already starts with "Bearer "
                string authHeader = _bearerToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) 
                    ? _bearerToken 
                    : $"Bearer {_bearerToken}";
                _httpClient.DefaultRequestHeaders.Add("Authorization", authHeader);

                _logger.LogInformation("MakeGraphQLRequestAsync: Making POST request to {Endpoint}", _graphqlEndpoint);
                _logger.LogDebug("MakeGraphQLRequestAsync: Request JSON: {Json}", json);
                
                HttpResponseMessage response = await _httpClient.PostAsync(_graphqlEndpoint, content);
                
                _logger.LogInformation("MakeGraphQLRequestAsync: Received response with status code: {StatusCode}", response.StatusCode);
                
                if (response.IsSuccessStatusCode)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("MakeGraphQLRequestAsync: Response content: {Content}", responseContent);
                    
                    JsonDocument jsonDocument = JsonDocument.Parse(responseContent);
                    _logger.LogInformation("MakeGraphQLRequestAsync: Successfully parsed JSON response");
                    return jsonDocument.RootElement;
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("MakeGraphQLRequestAsync: Hardcover API returned status code: {StatusCode}, Error: {Error}", 
                        response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "MakeGraphQLRequestAsync: Error making GraphQL request to Hardcover API");
                return null;
            }
        }
    }
} 