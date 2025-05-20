using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using HtmlAgilityPack;
using levihobbs.Models;
using System.Web;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System.Threading;
using System.IO;
using levihobbs.Services;
using Microsoft.Extensions.Logging;

namespace levihobbs.Controllers;

public class ReaderController : Controller
{
    private readonly ILogger<ReaderController> _logger;
    private readonly HttpClient _httpClient;
    private readonly SubstackApiClient _substackApiClient;
    private readonly MockDataService _mockDataService;

    public ReaderController(ILogger<ReaderController> logger, HttpClient httpClient, SubstackApiClient substackApiClient, MockDataService mockDataService)
    {
        _logger = logger;
        _httpClient = httpClient;
        _substackApiClient = substackApiClient;
        _mockDataService = mockDataService;
    }

    private string DecodeHtmlEntities(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return HttpUtility.HtmlDecode(text);
    }

    // Helper method to scrape book reviews from Goodreads
    private async Task<List<BookReview>> GetBookReviewsAsync()
    {
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
                        
            // Log a sample of the response to verify content
            int sampleLength = Math.Min(1000, content.Length);
            
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
                        string title = DecodeHtmlEntities(titleNode.InnerText.Trim());
                        string author = DecodeHtmlEntities(authorNode?.InnerText.Trim() ?? "Unknown Author");
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
                                string shelfText = DecodeHtmlEntities(shelfNode.InnerText.Trim());
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
                        string reviewText = DecodeHtmlEntities(reviewTextNode.InnerText.Trim());
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
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scraping book reviews from Goodreads");
        }
        
        return bookReviews;
    }

    public async Task<IActionResult> Index(string? category)
    {
        // Convert URL-friendly category to display category
        string displayCategory = category?.Replace("-", " ") ?? string.Empty;
        if (string.IsNullOrEmpty(displayCategory))
        {
            displayCategory = "All Stories";
        }
        else
        {
            // Capitalize each word in the category
            displayCategory = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayCategory);
        }
        
        // Handle book reviews separately
        if (displayCategory.Equals("Book Reviews", StringComparison.OrdinalIgnoreCase))
        {
            List<BookReview> bookReviews = await GetBookReviewsAsync();
            ViewData["Category"] = displayCategory;
            return View("BookReviews", bookReviews);
        }
        
        List<Story> filteredStories;
        string[] relevantCategories = new[] { "Fantasy", "Science Fiction", "Modern Fiction" };
        if (relevantCategories.Any(c => c.Equals(displayCategory, StringComparison.OrdinalIgnoreCase)))
        {
            List<StoryDTO> storyDtos = await _substackApiClient.GetStories(displayCategory);
            filteredStories = storyDtos.Select(dto => new Story
            {
                Title = dto.Title ?? string.Empty,
                Subtitle = dto.Subtitle ?? string.Empty,
                PreviewText = dto.Description ?? string.Empty,
                ImageUrl = dto.CoverImage ?? string.Empty,
                Category = displayCategory,
                ReadMoreUrl = dto.CanonicalUrl ?? string.Empty
            }).ToList();
        }
        else
        {
            // Handle regular stories
            List<Story> allStories = _mockDataService.GetStories();
            
            // Filter stories by category if a category is provided
            if (!string.IsNullOrEmpty(displayCategory) && !displayCategory.Equals("All Stories", StringComparison.OrdinalIgnoreCase))
            {
                filteredStories = allStories.Where(s => s.Category.Equals(displayCategory, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            else
            {
                // If no category is provided, show all stories
                filteredStories = allStories;
            }
        }
        
        // Pass the category and filtered stories to the view
        ViewData["Category"] = displayCategory;
        return View("Stories", filteredStories);
    }

    public IActionResult StoryDetail(int id)
    {
        List<Story> allStories = _mockDataService.GetStories();
        Story? story = allStories.FirstOrDefault(s => s.Id == id);
        
        if (story == null)
        {
            return NotFound();
        }

        ViewData["Title"] = story.Title;
        return View(story);
    }
}