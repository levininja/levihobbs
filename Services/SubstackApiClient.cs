using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using levihobbs.Models;

namespace levihobbs.Services
{
    public class SubstackApiClient
    {
        private readonly string _url = "https://levihobbs.substack.com";
        private readonly HttpClient _httpClient;

        public SubstackApiClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<StoryDTO>> GetStories(string query)
        {
            var response = await _httpClient.GetAsync($"https://levihobbs.substack.com/api/v1/archive?sort=new&search={query}&limit=10");
            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync();
            var jsonDoc = JsonDocument.Parse(content);
            var stories = new List<StoryDTO>();

            foreach (var item in jsonDoc.RootElement.EnumerateArray())
            {
                var story = new StoryDTO
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

        public async Task<List<StoryDTO>> SearchPostsAsync(string query, int limit = 20)
        {
            var paramsDict = new Dictionary<string, string>
            {
                { "sort", "new" },
                { "search", query }
            };

            var postData = await FetchPaginatedPostsAsync(paramsDict, limit);
            return postData.Select(item =>
            {
                var story = new StoryDTO
                {
                    Title = item.GetProperty("title").GetString(),
                    Subtitle = item.GetProperty("subtitle").GetString(),
                    Description = item.GetProperty("description").GetString(),
                    CoverImage = item.GetProperty("cover_image").GetString(),
                    CanonicalUrl = item.GetProperty("canonical_url").GetString()
                };

                if (item.TryGetProperty("post_date", out var postDate))
                {
                    story.PostDate = postDate.GetDateTime();
                }

                // Assuming Id is not provided by API, we'll generate a unique one based on URL hash
                story.Id = Math.Abs(story.CanonicalUrl.GetHashCode()).ToString();

                return story;
            }).ToList();
        }

        private async Task<List<JsonElement>> FetchPaginatedPostsAsync(Dictionary<string, string> paramsDict, int? limit = null, int pageSize = 15)
        {
            var results = new List<JsonElement>();
            int offset = 0;
            int batchSize = pageSize;
            bool moreItems = true;

            while (moreItems)
            {
                var currentParams = new Dictionary<string, string>(paramsDict);
                currentParams.Add("offset", offset.ToString());
                currentParams.Add("limit", batchSize.ToString());

                var queryString = string.Join("&", currentParams.Select(kv => $"{kv.Key}={kv.Value}"));
                var endpoint = $"{_url}/api/v1/archive?{queryString}";

                var response = await _httpClient.GetAsync(endpoint);
                if (!response.IsSuccessStatusCode)
                {
                    break;
                }

                var jsonString = await response.Content.ReadAsStringAsync();
                var items = JsonSerializer.Deserialize<List<JsonElement>>(jsonString);

                if (items == null || items.Count == 0)
                {
                    break;
                }

                results.AddRange(items);
                offset += batchSize;

                if (limit.HasValue && results.Count >= limit.Value)
                {
                    results = results.Take(limit.Value).ToList();
                    moreItems = false;
                }

                if (items.Count < batchSize)
                {
                    moreItems = false;
                }

                // Be nice to the API
                await Task.Delay(500);
            }

            return results;
        }
    }
}