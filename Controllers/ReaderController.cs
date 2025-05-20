using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using levihobbs.Models;
using levihobbs.Services;
using Microsoft.Extensions.Logging;

namespace levihobbs.Controllers;

public class ReaderController : Controller
{
    private readonly ILogger<ReaderController> _logger;
    private readonly SubstackApiClient _substackApiClient;
    private readonly MockDataService _mockDataService;
    private readonly GoodreadsScraperService _goodreadsScraperService;

    public ReaderController(
        ILogger<ReaderController> logger,
        SubstackApiClient substackApiClient,
        MockDataService mockDataService,
        GoodreadsScraperService goodreadsScraperService)
    {
        _logger = logger;
        _substackApiClient = substackApiClient;
        _mockDataService = mockDataService;
        _goodreadsScraperService = goodreadsScraperService;
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
            List<BookReview> bookReviews = await _goodreadsScraperService.GetBookReviewsAsync();
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
}