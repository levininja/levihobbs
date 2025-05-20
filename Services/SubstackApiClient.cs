using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using levihobbs.Models;

namespace levihobbs.Services
{
    /// <summary>
    /// Client for interacting with the Substack API to fetch story content.
    /// This service handles the communication with Substack's API endpoints and
    /// transforms the response into our application's data models.
    /// </summary>
    public class SubstackApiClient
    {
        private readonly string _url = "https://levihobbs.substack.com";
        private readonly HttpClient _httpClient;

        public SubstackApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        /// <summary>
        /// Retrieves stories from Substack based on a search query.
        /// </summary>
        /// <param name="query">The search term to filter stories by.</param>
        /// <returns>A list of StoryDTO objects containing the story data from Substack.</returns>
        public async Task<List<StoryDTO>> GetStories(string query)
        {
            HttpResponseMessage response = await _httpClient.GetAsync($"https://levihobbs.substack.com/api/v1/archive?sort=new&search={query}&limit=10");
            response.EnsureSuccessStatusCode();
            
            string content = await response.Content.ReadAsStringAsync();
            JsonDocument jsonDoc = JsonDocument.Parse(content);
            List<StoryDTO> stories = new List<StoryDTO>();

            foreach (JsonElement item in jsonDoc.RootElement.EnumerateArray())
            {
                StoryDTO story = new StoryDTO
                {
                    Title = item.GetProperty("title").GetString(),
                    Subtitle = item.GetProperty("subtitle").GetString(),
                    Description = item.GetProperty("description").GetString(),
                    CoverImage = item.GetProperty("cover_image").GetString(),
                    CanonicalUrl = item.GetProperty("canonical_url").GetString()
                };
                stories.Add(story);
            }

            return stories;
        }

        /// <summary>
        /// Searches for posts on Substack with pagination support.
        /// This method allows for more control over the number of results and implements
        /// pagination to handle large result sets efficiently.
        /// </summary>
        /// <param name="query">The search term to filter posts by.</param>
        /// <param name="limit">Maximum number of posts to return (default: 20).</param>
        /// <returns>A list of StoryDTO objects containing the post data from Substack.</returns>
        public async Task<List<StoryDTO>> SearchPostsAsync(string query, int limit = 20)
        {
            Dictionary<string, string> paramsDict = new Dictionary<string, string>
            {
                { "sort", "new" },
                { "search", query }
            };

            List<JsonElement> postData = await FetchPaginatedPostsAsync(paramsDict, limit);
            return postData.Select(item =>
            {
                StoryDTO story = new StoryDTO
                {
                    Title = item.GetProperty("title").GetString(),
                    Subtitle = item.GetProperty("subtitle").GetString(),
                    Description = item.GetProperty("description").GetString(),
                    CoverImage = item.GetProperty("cover_image").GetString(),
                    CanonicalUrl = item.GetProperty("canonical_url").GetString()
                };

                if (item.TryGetProperty("post_date", out JsonElement postDate))
                {
                    story.PostDate = postDate.GetDateTime();
                }

                // Generate a unique ID based on the URL hash since Substack doesn't provide one
                story.Id = Math.Abs(story.CanonicalUrl.GetHashCode()).ToString();

                return story;
            }).ToList();
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
                Dictionary<string, string> currentParams = new Dictionary<string, string>(paramsDict);
                currentParams.Add("offset", offset.ToString());
                currentParams.Add("limit", batchSize.ToString());

                string queryString = string.Join("&", currentParams.Select(kv => $"{kv.Key}={kv.Value}"));
                string endpoint = $"{_url}/api/v1/archive?{queryString}";

                HttpResponseMessage response = await _httpClient.GetAsync(endpoint);
                if (!response.IsSuccessStatusCode)
                {
                    break;
                }

                string jsonString = await response.Content.ReadAsStringAsync();
                List<JsonElement> items = JsonSerializer.Deserialize<List<JsonElement>>(jsonString);

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
    }
}