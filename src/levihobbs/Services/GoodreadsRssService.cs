using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Serialization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using levihobbs.Models;

namespace levihobbs.Services
{
    /// <summary>
    /// Service implementation for retrieving and caching Goodreads RSS feed data.
    /// Provides functionality to fetch user's reading updates from Goodreads and cache them
    /// to minimize API calls.
    /// </summary>
    public class GoodreadsRssService : IGoodreadsRssService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GoodreadsRssService> _logger;
        private readonly IMemoryCache _cache;
        private readonly string _userId;
        private static readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1);

        public GoodreadsRssService(
            HttpClient httpClient, 
            ILogger<GoodreadsRssService> logger, 
            IMemoryCache cache,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _cache = cache;
            _userId = configuration["Goodreads:UserId"] ?? 
                throw new InvalidOperationException("Goodreads UserId not found in confugration file.");
        }

        /// <summary>
        /// Retrieves the RSS feed for the configured Goodreads user.
        /// Implements caching to minimize API calls and improve performance.
        /// </summary>
        /// <returns>A task that represents the asynchronous operation. The task result contains the RSS channel data if successful, or null if the operation fails.</returns>
        public async Task<RssChannel?> GetRssFeedAsync()
        {
            string cacheKey = $"goodreads_rss_{_userId}";
            
            if (_cache.TryGetValue(cacheKey, out RssChannel? cachedFeed))
            {
                _logger.LogInformation("Cache HIT for Goodreads RSS feed");
                return cachedFeed;
            }

            _logger.LogInformation("Cache MISS for Goodreads RSS feed, fetching from API");

            try
            {
                string url = $"https://www.goodreads.com/user/updates_rss/{_userId}";
                
                HttpResponseMessage response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to fetch Goodreads RSS: {StatusCode}", response.StatusCode);
                    return null;
                }

                string xmlContent = await response.Content.ReadAsStringAsync();

                // Log the XML namespace if present
                if (xmlContent.Contains("xmlns="))
                {
                    int xmlnsIndex = xmlContent.IndexOf("xmlns=");
                    int endIndex = xmlContent.IndexOf(">", xmlnsIndex);
                    if (endIndex > xmlnsIndex)
                    {
                        string xmlns = xmlContent.Substring(xmlnsIndex, endIndex - xmlnsIndex);
                    }
                }

                // Parse XML
                XmlSerializer serializer = new XmlSerializer(typeof(RssFeed));
                using StringReader reader = new StringReader(xmlContent);
                
                try
                {
                    RssFeed? feed = (RssFeed?)serializer.Deserialize(reader);
                    
                    if (feed?.Channel != null)
                    {
                        _cache.Set(cacheKey, feed.Channel, _cacheDuration);
                        return feed.Channel;
                    }
                    else
                    {
                        _logger.LogWarning("Deserialized feed or channel is null");
                        return null;
                    }
                }
                catch (InvalidOperationException ex)
                {
                    _logger.LogError(ex, "XML Deserialization failed. Inner exception: {InnerException}", 
                        ex.InnerException?.Message ?? "No inner exception");
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching or parsing Goodreads RSS feed. Exception type: {ExceptionType}", 
                    ex.GetType().Name);
                return null;
            }
        }
    }
}