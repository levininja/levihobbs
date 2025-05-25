using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using levihobbs.Data;
using levihobbs.Models;
using Microsoft.EntityFrameworkCore;
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

        public async Task<byte[]?> GetBookCoverImageAsync(string title, string author)
        {
            // Clean up the search term by removing newlines and extra spaces
            string cleanTitle = title.Replace("\n", " ").Replace("\r", "").Trim();
            string cleanAuthor = author.Replace("\n", " ").Replace("\r", "").Trim();
            
            // Remove special characters that might interfere with the search
            cleanTitle = Regex.Replace(cleanTitle, @"[^\w\s\-\(\)\.]", "");
            cleanAuthor = Regex.Replace(cleanAuthor, @"[^\w\s\-\(\)\.]", "");
            
            string searchTerm = $"{cleanTitle} by {cleanAuthor}";
            
            _logger.LogInformation("Searching for book cover: {SearchTerm}", searchTerm);
            
            // Check if we already have this image in the database
            var existingImage = await _dbContext.BookCoverImages
                .FirstOrDefaultAsync(i => i.SearchTerm == searchTerm);
                
            if (existingImage != null)
            {
                _logger.LogInformation("Found existing book cover for {SearchTerm}", searchTerm);
                // Update the last accessed date
                existingImage.DateAccessed = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
                return existingImage.ImageData;
            }
            
            // If not in database, fetch from Google
            try
            {
                string url = $"https://www.googleapis.com/customsearch/v1?key={_settings.ApiKey}&cx={_settings.SearchEngineId}&q={Uri.EscapeDataString(searchTerm)}&searchType=image&imgSize=medium&num=1";
                
                _logger.LogInformation("Making request to Google API with URL: {Url}", url);
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
                _logger.LogInformation("Received response from Google API: {Content}", content);
                
                var searchResult = JsonSerializer.Deserialize<GoogleSearchResult>(content);
                if (searchResult?.Items?.Count > 0)
                {
                    var imageItem = searchResult.Items[0];
                    _logger.LogInformation("Processing search result item: {Item}", 
                        JsonSerializer.Serialize(imageItem, new JsonSerializerOptions { WriteIndented = true }));
                    
                    string imageUrl;

                    // Try to get image URL from the new format first
                    if (!string.IsNullOrEmpty(imageItem.Link))
                    {
                        imageUrl = imageItem.Link;
                        _logger.LogInformation("Found image URL in Link property: {ImageUrl}", imageUrl);
                    }
                    // Fall back to the original format
                    else if (imageItem.PageMap?.CseImage?.Count > 0)
                    {
                        imageUrl = imageItem.PageMap.CseImage[0].Src;
                        _logger.LogInformation("Found image URL in PageMap.CseImage[0].Src: {ImageUrl}", imageUrl);
                    }
                    else
                    {
                        _logger.LogWarning("No image URL found in search result. Full item structure: {ItemStructure}", 
                            JsonSerializer.Serialize(imageItem, new JsonSerializerOptions { WriteIndented = true }));
                        return null;
                    }

                    _logger.LogInformation("Found image URL: {ImageUrl}", imageUrl);
                    
                    // Download the image
                    var imageResponse = await _httpClient.GetAsync(imageUrl);
                    if (imageResponse.IsSuccessStatusCode)
                    {
                        var imageData = await imageResponse.Content.ReadAsByteArrayAsync();
                        _logger.LogInformation("Successfully downloaded image, size: {Size} bytes", imageData.Length);
                        
                        // Get image dimensions and type
                        using var image = Image.Load(imageData);
                        int width = imageItem.Image?.Width ?? image.Width;
                        int height = imageItem.Image?.Height ?? image.Height;
                        string fileType = Path.GetExtension(imageUrl).TrimStart('.');
                        
                        _logger.LogInformation("Image details - Width: {Width}, Height: {Height}, Type: {FileType}", width, height, fileType);
                        _logger.LogInformation("Image metadata from API - Width: {ApiWidth}, Height: {ApiHeight}, ByteSize: {ByteSize}, ThumbnailLink: {ThumbnailLink}", 
                            imageItem.Image?.Width, 
                            imageItem.Image?.Height, 
                            imageItem.Image?.ByteSize, 
                            imageItem.Image?.ThumbnailLink);
                        
                        // Store in database
                        var bookCoverImage = new BookCoverImage
                        {
                            SearchTerm = searchTerm,
                            ImageData = imageData,
                            Width = width,
                            Height = height,
                            FileType = fileType,
                            DateAccessed = DateTime.UtcNow
                        };

                        _dbContext.BookCoverImages.Add(bookCoverImage);
                        await _dbContext.SaveChangesAsync();
                        
                        _logger.LogInformation("Successfully saved book cover to database for {SearchTerm}", searchTerm);
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
                else
                {
                    _logger.LogWarning("No items found in search result. Full response: {Response}", 
                        JsonSerializer.Serialize(searchResult, new JsonSerializerOptions { WriteIndented = true }));
                }
                
                _logger.LogWarning("No image found for {SearchTerm}", searchTerm);
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