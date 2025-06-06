using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using levihobbs.Data;
using levihobbs.Models;
using levihobbs.Utils;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using System.Text.RegularExpressions;
using System.Text.Json.Serialization;

namespace levihobbs.Services
{
    public class BookCoverService : IBookCoverService
    {
        private readonly ILogger<BookCoverService> _logger;
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _dbContext;
        private readonly GoogleCustomSearchSettings _settings;

        public BookCoverService(
            ILogger<BookCoverService> logger,
            HttpClient httpClient,
            ApplicationDbContext dbContext,
            IOptions<GoogleCustomSearchSettings> settings)
        {
            _logger = logger;
            _httpClient = httpClient;
            _dbContext = dbContext;
            _settings = settings.Value;
            
            if (string.IsNullOrEmpty(_settings.ApiKey) || string.IsNullOrEmpty(_settings.SearchEngineId))
            {
                throw new InvalidOperationException("Google Custom Search settings are not properly configured");
            }

            // Add a User-Agent header to handle sites that require it (like Wikimedia)
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (compatible; LeviHobbsBookCoverBot/1.0; +https://levihobbs.com)");
        }

        /// <summary>
        /// Called when we don't yet have a high-quality image for a book stored in the db.
        /// Gets a book cover image from the Google Custom Search API, returns it, and also
        /// stores it in the db for future use.
        /// </summary>
        /// <param name="searchTerm">The title and author of the book to search for</param>
        /// <returns>The image data for the book cover, or null if no image is found</returns>
        public async Task<byte[]?> GetBookCoverImageAsync(string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm))
                return null;
            
            // Check if we already have this image in the database
            var existingImage = await _dbContext.BookCoverImages
                .FirstOrDefaultAsync(i => i.Name == searchTerm);
                
            if (existingImage != null)
            {
                // Log warning about duplicate image fetch attempt
                var warningLog = new ErrorLog
                {
                    LogLevel = "Warning", 
                    Message = $"GetBookCoverImageAsync called for '{searchTerm}' which already exists in database; shouldn't be happening.",
                    Source = "BookCoverService",
                    LogDate = DateTime.UtcNow
                };
                _dbContext.ErrorLogs.Add(warningLog);
                await _dbContext.SaveChangesAsync();
                return existingImage.ImageData;
            }
            
            // If not in database, fetch from Google
            try
            {
                // Build Google Custom Search API URL
                // See docs: https://developers.google.com/custom-search/v1/using_rest
                string url = $"https://www.googleapis.com/customsearch/v1" +
                    $"?key={_settings.ApiKey}" + // API key for authentication
                    $"&cx={_settings.SearchEngineId}" + // Custom Search Engine ID
                    $"&q={Uri.EscapeDataString(searchTerm)}" + // Search query, URL encoded
                    "&searchType=image" + // Restrict to image search results only
                    "&imgSize=medium" + // Return medium-sized images (~400x400px)
                    "&num=1"; // Return only 1 result to minimize API usage
                
                var response = await _httpClient.GetAsync(url);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Google API returned error {StatusCode}: {ErrorContent}", response.StatusCode, errorContent);
                    
                    // Log API error to database
                    var apiError = new ErrorLog
                    {
                        LogLevel = "Error",
                        Message = $"Book Cover API Error for '{searchTerm}': Status {response.StatusCode}",
                        Source = "BookCoverService",
                        StackTrace = errorContent,
                        LogDate = DateTime.UtcNow
                    };
                    _dbContext.ErrorLogs.Add(apiError);
                    await _dbContext.SaveChangesAsync();
                    
                    return null;
                }
                
                var content = await response.Content.ReadAsStringAsync();
                var searchResult = JsonSerializer.Deserialize<GoogleSearchResult>(content);
                if (searchResult?.Items?.Count > 0)
                {
                    var imageItem = searchResult.Items[0];
                    string imageUrl;

                    // Try to get image URL from the new format first
                    if (!string.IsNullOrEmpty(imageItem.Link))
                    {
                        imageUrl = imageItem.Link;
                    }
                    // Fall back to the original format
                    else if (imageItem.PageMap?.CseImage?.Count > 0)
                    {
                        imageUrl = imageItem.PageMap.CseImage[0].Src;
                    }
                    else
                    {
                        return null;
                    }
                    
                    // Download the image
                    var imageResponse = await _httpClient.GetAsync(imageUrl);
                    if (imageResponse.IsSuccessStatusCode)
                    {
                        var imageData = await imageResponse.Content.ReadAsByteArrayAsync();
                        
                        // Get image dimensions and type
                        using var image = Image.Load(imageData);
                        int width = imageItem.Image?.Width ?? image.Width;
                        int height = imageItem.Image?.Height ?? image.Height;
                        string fileType = Path.GetExtension(imageUrl).TrimStart('.');
                        
                        // Store in database
                        var bookCoverImage = new BookCoverImage
                        {
                            Name = searchTerm,
                            ImageData = imageData,
                            Width = width,
                            Height = height,
                            FileType = fileType,
                            DateAccessed = DateTime.UtcNow
                        };

                        _dbContext.BookCoverImages.Add(bookCoverImage);
                        await _dbContext.SaveChangesAsync();
                        
                        return imageData;
                    }
                    else
                    {
                        var errorContent = await imageResponse.Content.ReadAsStringAsync();
                        _logger.LogError("Failed to download image from {ImageUrl}. Status: {StatusCode}, Error: {ErrorContent}", 
                            imageUrl, imageResponse.StatusCode, errorContent);
                            
                        // Log download error to database
                        var downloadError = new ErrorLog
                        {
                            LogLevel = "Error",
                            Message = $"Book Cover Download Error for '{searchTerm}' from {imageUrl}",
                            Source = "BookCoverService",
                            StackTrace = $"Status: {imageResponse.StatusCode}, Content: {errorContent}",
                            LogDate = DateTime.UtcNow
                        };
                        _dbContext.ErrorLogs.Add(downloadError);
                        await _dbContext.SaveChangesAsync();
                    }
                }
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching book cover for {SearchTerm}", searchTerm);
                return null;
            }
        }
        
        // Class to deserialize Google Search API response
        private class GoogleSearchResult
        {
            [JsonPropertyName("items")]
            public List<GoogleSearchItem>? Items { get; set; }
        }
        
        private class GoogleSearchItem
        {
            [JsonPropertyName("link")]
            public string Link { get; set; } = string.Empty;

            [JsonPropertyName("image")]
            public GoogleImageInfo? Image { get; set; }

            // For backward compatibility with the original format
            [JsonPropertyName("pagemap")]
            public PageMap? PageMap { get; set; }
        }

        private class GoogleImageInfo
        {
            [JsonPropertyName("height")]
            public int Height { get; set; }

            [JsonPropertyName("width")]
            public int Width { get; set; }

            [JsonPropertyName("byteSize")]
            public long ByteSize { get; set; }

            [JsonPropertyName("thumbnailLink")]
            public string ThumbnailLink { get; set; } = string.Empty;
        }

        // For backward compatibility with the original format
        private class PageMap
        {
            [JsonPropertyName("cse_image")]
            public List<CseImage>? CseImage { get; set; }
        }

        private class CseImage
        {
            [JsonPropertyName("src")]
            public string Src { get; set; } = string.Empty;
        }
    }
}