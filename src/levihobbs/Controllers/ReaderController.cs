using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using levihobbs.Models;
using levihobbs.Services;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;
using levihobbs.Data;
using Microsoft.EntityFrameworkCore;

namespace levihobbs.Controllers;

public class ReaderController : Controller
{
    private readonly ILogger<ReaderController> _logger;
    private readonly ISubstackApiClient _substackApiClient;
    private readonly IMockDataService _mockDataService;
    private readonly ApplicationDbContext _dbContext;

    public ReaderController(
        ILogger<ReaderController> logger,
        ISubstackApiClient substackApiClient,
        IMockDataService mockDataService,
        ApplicationDbContext dbContext)
    {
        _logger = logger;
        _substackApiClient = substackApiClient;
        _mockDataService = mockDataService;
        _dbContext = dbContext;
    }

    public async Task<IActionResult> Read(string? category, string? shelf)
    {
        if (string.IsNullOrEmpty(category))
            return RedirectToAction("Index", "BookReviews");

        // Convert URL-friendly category to display category
        string displayCategory = category?.Replace("-", " ") ?? string.Empty;
        if (string.IsNullOrEmpty(displayCategory))
            displayCategory = "All Stories";
        else
            displayCategory = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(displayCategory);
    
    
        if (String.Equals(displayCategory, "Book Reviews", StringComparison.OrdinalIgnoreCase))
            return RedirectToAction("Index", "BookReviews");
        else
            return await Stories(displayCategory, shelf);
    }


    
    public async Task<IActionResult> Stories(string? displayCategory, string? shelf)
    {        
        StoriesViewModel viewModel = new StoriesViewModel
        {
            Category = displayCategory ?? string.Empty
        };
        string[] storyCategories = new[] { "Fantasy", "Science Fiction", "Modern Fiction" };
        
        if (!string.IsNullOrEmpty(displayCategory) && storyCategories.Any(c => c.Equals(displayCategory, StringComparison.OrdinalIgnoreCase)))
        {
            List<StoryDTO> storyDtos = await _substackApiClient.GetStories(displayCategory);
            List<Story> allStories = storyDtos.Select(dto => new Story
            {
                Title = dto.Title ?? string.Empty,
                Subtitle = dto.Subtitle ?? string.Empty,
                PreviewText = dto.Description ?? string.Empty,
                ImageUrl = dto.CoverImage ?? string.Empty,
                Category = displayCategory,
                ReadMoreUrl = dto.CanonicalUrl ?? string.Empty
            }).ToList();
            
            // Group stories with similar titles
            GroupSimilarStories(allStories, viewModel);
        }
        else
        {
            viewModel.NoStoriesMessage = string.IsNullOrEmpty(displayCategory) 
                ? "Please select a category to view stories." 
                : $"No stories found in the category '{displayCategory}'.";
        }
        
        return View("Stories", viewModel);
    }

    public void GroupSimilarStories(List<Story> stories, StoriesViewModel viewModel)
    {
        // Pattern 1: "X - Y" where X is the same (e.g., "The Legend of Elsbeth - Chapter 1")
        // Regex pattern: @"^(.+)\s+-\s+(.+)$"
        // ^ - Start of string
        // (.+) - First capture group: one or more of any character (the story title)
        // \s+ - One or more whitespace characters
        // - - Literal hyphen
        // \s+ - One or more whitespace characters
        // (.+) - Second capture group: one or more of any character (the chapter/part)
        // $ - End of string
        List<IGrouping<string, (Story Story, Match Match)>> pattern1Groups = stories
            .Select(s => (Story: s, Match: Regex.Match(s.Title, @"^(.+)\s+-\s+(.+)$")))
            .Where(x => x.Match.Success)
            .GroupBy(x => x.Match.Groups[1].Value)
            .Where(g => g.Count() > 1)
            .ToList();
            
        // Pattern 2: "X (Y/Z)" where X and Z are the same (e.g., "The Wife and the Terrorist (1/4)")
        // Regex pattern: @"^(.+)\s+\((\d+)/(\d+)\)$"
        // ^ - Start of string
        // (.+) - First capture group: one or more of any character (the story title)
        // \s+ - One or more whitespace characters
        // \( - Literal opening parenthesis
        // (\d+) - Second capture group: one or more digits (the current part number)
        // / - Literal forward slash
        // (\d+) - Third capture group: one or more digits (the total number of parts)
        // \) - Literal closing parenthesis
        // $ - End of string
        List<IGrouping<(string Title, string Total), (Story Story, Match Match)>> pattern2Groups = stories
            .Select(s => (Story: s, Match: Regex.Match(s.Title, @"^(.+)\s+\((\d+)/(\d+)\)$")))
            .Where(x => x.Match.Success)
            .GroupBy(x => (Title: x.Match.Groups[1].Value, Total: x.Match.Groups[3].Value))
            .Where(g => g.Count() > 1)
            .ToList();
            
        // Process pattern 1 groups
        foreach (IGrouping<string, (Story Story, Match Match)> group in pattern1Groups)
        {
            StoryGroup storyGroup = new StoryGroup
            {
                Title = group.Key,
                Stories = SortStoriesInGroup(group.Select(x => x.Story).ToList())
            };
            
            viewModel.StoryGroups.Add(storyGroup);
            
            // Remove these stories from the original list
            foreach ((Story Story, Match Match) item in group)
            {
                stories.Remove(item.Story);
            }
        }
        
        // Process pattern 2 groups
        foreach (IGrouping<(string Title, string Total), (Story Story, Match Match)> group in pattern2Groups)
        {
            StoryGroup storyGroup = new StoryGroup
            {
                Title = $"{group.Key.Title} (Series of {group.Key.Total})",
                Stories = SortStoriesInGroup(group.Select(x => x.Story).ToList())
            };
            
            viewModel.StoryGroups.Add(storyGroup);
            
            // Remove these stories from the original list
            foreach ((Story Story, Match Match) item in group)
            {
                stories.Remove(item.Story);
            }
        }
        
        // Add remaining individual stories
        viewModel.Stories = stories;
    }
    
    // Sorts stories in a group by extracting numeric parts for natural ordering
    public List<Story> SortStoriesInGroup(List<Story> stories)
    {
        stories.Sort((a, b) =>
        {
            // Extract numeric part from title (e.g., "Chapter 1" -> 1, "2/4" -> 2)
            int? numA = ExtractNumberFromTitle(a.Title);
            int? numB = ExtractNumberFromTitle(b.Title);
            if (numA.HasValue && numB.HasValue)
                return numA.Value.CompareTo(numB.Value);  // Numeric compare
            return string.Compare(a.Title, b.Title, StringComparison.OrdinalIgnoreCase);  // Fallback to string
        });
        return stories;
    }
    
    // Extract the first number from a title (e.g., from "Chapter 10" or "2/4")
    // Regex pattern: @"\d+"
    // \d+ - One or more digits (0-9)
    // This will match the first sequence of digits in the string
    public int? ExtractNumberFromTitle(string title)
    {
        Match match = Regex.Match(title, @"\d+");
        return match.Success ? int.Parse(match.Value) : (int?)null;
    }
}