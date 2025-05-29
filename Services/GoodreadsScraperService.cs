using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using levihobbs.Models;
using levihobbs.Utils;
using System.Web;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;
using levihobbs.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace levihobbs.Services;

public class GoodreadsScraperService
{
    private readonly ILogger<GoodreadsScraperService> _logger;
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ApplicationDbContext _dbContext;
    private static readonly TimeSpan _cacheDuration = TimeSpan.FromDays(1);

    public GoodreadsScraperService(
        ILogger<GoodreadsScraperService> logger, 
        HttpClient httpClient,
        IMemoryCache cache,
        ApplicationDbContext dbContext)
    {
        _logger = logger;
        _httpClient = httpClient;
        _cache = cache;
        _dbContext = dbContext;
    }

    private string DecodeHtmlEntities(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return HttpUtility.HtmlDecode(text);
    }

    private string CleanText(string text)
    {
        if (string.IsNullOrEmpty(text))
            return string.Empty;

        // Replace newlines and multiple spaces with a single space
        return Regex.Replace(text, @"\s+", " ").Trim();
    }

    private string CleanSearchTerm(string title, string author)
    {
        // Clean up the search term by removing newlines and extra spaces
        string cleanTitle = title.Replace("\n", " ").Replace("\r", "").Trim();
        string cleanAuthor = author.Replace("\n", " ").Replace("\r", "").Trim();
        
        // Remove special characters that might interfere with the search
        cleanTitle = Regex.Replace(cleanTitle, @"[^\w\s\-\(\)\.]", "");
        cleanAuthor = Regex.Replace(cleanAuthor, @"[^\w\s\-\(\)\.]", "");
        
        return $"{cleanTitle} by {cleanAuthor}";
    }

    public async Task<List<BookReview>> GetBookReviewsAsync()
    {
        const string cacheKey = "goodreads_book_reviews";
        
        if (_cache.TryGetValue(cacheKey, out List<BookReview>? cachedReviews))
        {
            _logger.LogInformation("Cache HIT for key: {CacheKey} with {Count} reviews", cacheKey, cachedReviews?.Count ?? 0);
            return cachedReviews;
        }

        _logger.LogInformation("Cache MISS for key: {CacheKey}, fetching from Goodreads", cacheKey);

        List<BookReview> bookReviews = new List<BookReview>();
        try
        {
            string url = "https://www.goodreads.com/review/list/96423614-levi-hobbs?order=d&sort=review&view=reviews";
            
            // Get response as a stream to handle compression
            HttpResponseMessage response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();
            
            string content;
            using (Stream stream = await response.Content.ReadAsStreamAsync())
            using (StreamReader reader = new StreamReader(stream))
            {
                content = await reader.ReadToEndAsync();
            }
                        
            HtmlDocument htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(content);
            
            // Select all review items
            HtmlNodeCollection? reviewNodes = htmlDocument.DocumentNode.SelectNodes("//tr[@class='bookalike review']");
            
            if (reviewNodes != null)
            {
                int id = 1;
                foreach (HtmlNode reviewNode in reviewNodes)
                {
                    HtmlNode? coverNode = reviewNode.SelectSingleNode(".//td[@class='field cover']//img");
                    HtmlNode? titleNode = reviewNode.SelectSingleNode(".//td[@class='field title']//a");
                    HtmlNode? authorNode = reviewNode.SelectSingleNode(".//td[@class='field author']//a");
                    HtmlNode? datePublishedNode = reviewNode.SelectSingleNode(".//td[@class='field date_pub']//div[@class='value']");
                    HtmlNode? ratingNode = reviewNode.SelectSingleNode(".//div[@class='value']/div[@class='stars']");
                    HtmlNode? shelvesNode = reviewNode.SelectSingleNode(".//td[@class='field shelves']//div[@class='value']");
                    HtmlNode? dateReadNode = reviewNode.SelectSingleNode(".//td[@class='field date_read']//div[@class='value']");
                    
                    // Get the review text from either the visible container or the hidden full text
                    HtmlNode? reviewTextNode = reviewNode.SelectSingleNode(".//span[starts-with(@id, 'freeTextContainer')]") ??
                                           reviewNode.SelectSingleNode(".//span[starts-with(@id, 'freeText')]");
                    
                    // Extract the view link
                    HtmlNode? viewLinkNode = reviewNode.SelectSingleNode(".//td[@class='field review']//a[contains(@href, '/review/show/')]");
                    
                    if (titleNode != null && reviewTextNode != null)
                    {
                        string imageUrl = coverNode?.GetAttributeValue("src", "") ?? string.Empty;
                        string title = CleanText(DecodeHtmlEntities(titleNode.InnerText));
                        string author = CleanText(DecodeHtmlEntities(authorNode?.InnerText ?? "Unknown Author"));
                        string datePublishedText = datePublishedNode?.InnerText.Trim() ?? string.Empty;
                        DateTime datePublished = DateTime.TryParse(datePublishedText, out DateTime parsedDate) ? parsedDate : DateTime.UtcNow;
                        
                        // Parse star rating
                        string ratingText = ratingNode?.GetAttributeValue("data-rating", "0") ?? "0";                        
                        int starRating = int.TryParse(ratingText, out int rating) ? rating : 0;
                        
                        // Parse shelves - exclude rating options and "add to shelves"
                        List<string> shelves = new List<string>();
                        HtmlNodeCollection? shelfNodes = shelvesNode?.SelectNodes(".//a[not(contains(@class, 'actionLinkLite'))]");
                        if (shelfNodes != null)
                        {
                            foreach (HtmlNode shelfNode in shelfNodes)
                            {
                                string shelfText = CleanText(DecodeHtmlEntities(shelfNode.InnerText));
                                if (!string.IsNullOrEmpty(shelfText))
                                {
                                    shelves.Add(shelfText);
                                }
                            }
                        }
                        
                        // Parse date read
                        string dateReadText = dateReadNode?.InnerText.Trim() ?? string.Empty;
                        DateTime dateRead = DateTime.TryParse(dateReadText, out DateTime readDate) ? readDate : DateTime.UtcNow;
                        
                        // Get review text and view link
                        string reviewText = CleanText(DecodeHtmlEntities(reviewTextNode.InnerText));
                        string viewLink = viewLinkNode?.GetAttributeValue("href", "") ?? string.Empty;
                        if (!string.IsNullOrEmpty(viewLink) && !viewLink.StartsWith("http"))
                        {
                            viewLink = "https://www.goodreads.com" + viewLink;
                        }
                        
                        BookReview review = new BookReview
                        {
                            Id = id++,
                            Title = title,
                            Subtitle = $"By {author}, {datePublished.Year}",
                            Author = author,
                            DatePublished = datePublished,
                            StarRating = starRating,
                            Shelves = shelves,
                            DateRead = dateRead,
                            PreviewText = reviewText,
                            ImageUrl = imageUrl,
                            Category = "Book Reviews",
                            ReadMoreUrl = viewLink
                        };
                        bookReviews.Add(review);
                    }
                }
            }
            // After creating all book reviews, check for stored images
            foreach (var review in bookReviews)
            {
                string searchTerm = Utilities.CleanSearchTerm(review.Title, review.Author);
                var storedImage = await _dbContext.BookCoverImages
                    .FirstOrDefaultAsync(i => i.Name == searchTerm);
                    
                if (storedImage != null)
                {
                    review.ImageRawData = storedImage.ImageData;
                }
            }
            
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping book reviews from Goodreads");
        }

        _cache.Set(cacheKey, bookReviews, _cacheDuration);
        
        return bookReviews;
    }
} 