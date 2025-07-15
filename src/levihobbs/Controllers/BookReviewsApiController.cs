using levihobbs.Services;
using levihobbs.Data;
using levihobbs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace levihobbs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookReviewsApiController : ControllerBase
    {
        private readonly ILogger<BookReviewsApiController> _logger;
        private readonly IBookReviewSearchService _bookReviewSearchService;
        private readonly ApplicationDbContext _context;
        
        public BookReviewsApiController(
            ILogger<BookReviewsApiController> logger,
            IBookReviewSearchService bookReviewSearchService,
            ApplicationDbContext context)
        {
            _logger = logger;
            _bookReviewSearchService = bookReviewSearchService;
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetBookReviews(string? displayCategory, string? shelf, string? grouping, bool recent = false, string? searchTerm = null)
        {
            // If searchTerm is provided, use search functionality
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetBookReviewSearchResults(displayCategory, shelf, grouping, recent, searchTerm);
            }
            
            // Otherwise, use browse functionality
            try
            {
                // Check if custom mappings are enabled
                bool useCustomMappings = await _context.Bookshelves.AnyAsync(bs => bs.Display.HasValue);
                
                // Get bookshelves and groupings based on custom mapping settings
                List<Bookshelf> allBookshelves;
                List<BookshelfGrouping> allBookshelfGroupings = new List<BookshelfGrouping>();
                
                if (useCustomMappings)
                {
                    // Only show bookshelves that are marked for display and not in any grouping
                    var bookshelvesInGroupings = await _context.BookshelfGroupings
                        .SelectMany(bg => bg.Bookshelves.Select(bs => bs.Id))
                        .ToListAsync();
                        
                    allBookshelves = await _context.Bookshelves
                        .Where(bs => bs.Display == true && !bookshelvesInGroupings.Contains(bs.Id))
                        .OrderBy(bs => bs.DisplayName ?? bs.Name)
                        .ToListAsync();
                        
                    allBookshelfGroupings = await _context.BookshelfGroupings
                        .Include(bg => bg.Bookshelves)
                        .OrderBy(bg => bg.DisplayName ?? bg.Name)
                        .ToListAsync();
                }
                else
                {
                    // Show all bookshelves as before
                    allBookshelves = await _context.Bookshelves
                        .OrderBy(bs => bs.DisplayName ?? bs.Name)
                        .ToListAsync();
                }
                
                // Default to "favorites" shelf if no shelf/grouping is specified and not showing recent
                if (string.IsNullOrEmpty(shelf) && string.IsNullOrEmpty(grouping) && !recent)
                    shelf = "favorites";
                
                // Build the query for book reviews - only include reviews with content
                var bookReviewsQuery = _context.BookReviews
                    .Include(br => br.Bookshelves)
                    .Include(br => br.Tones)
                    .Include(br => br.CoverImage)
                    .Where(br => br.HasReviewContent == true)
                    .AsQueryable();
                
                // Apply filters
                if (recent)
                {
                    bookReviewsQuery = bookReviewsQuery
                        .OrderByDescending(r => r.DateRead)
                        .Take(10);
                }
                else if (!string.IsNullOrEmpty(grouping))
                {
                    // Filter by grouping - get all bookshelves in the grouping
                    var groupingBookshelfNames = await _context.BookshelfGroupings
                        .Where(bg => bg.Name.ToLower() == grouping.ToLower())
                        .SelectMany(bg => bg.Bookshelves.Select(bs => bs.Name))
                        .ToListAsync();
                        
                    bookReviewsQuery = bookReviewsQuery
                        .Where(br => br.Bookshelves.Any(bs => groupingBookshelfNames.Contains(bs.Name)));
                }
                else if (!string.IsNullOrEmpty(shelf))
                {
                    // Filter by individual shelf
                    bookReviewsQuery = bookReviewsQuery
                        .Where(br => br.Bookshelves.Any(bs => bs.Name.ToLower() == shelf.ToLower()));
                }
                
                if (!recent)
                {
                    bookReviewsQuery = bookReviewsQuery.OrderByDescending(r => r.DateRead);
                }
                
                var bookReviews = await bookReviewsQuery.ToListAsync();
                
                var result = new
                {
                    Category = displayCategory,
                    AllBookshelves = allBookshelves.Select(bs => new { bs.Id, bs.Name, bs.IsGenreBased }).ToList(),
                    AllBookshelfGroupings = allBookshelfGroupings.Select(bg => new 
                    { 
                        bg.Id, 
                        bg.Name,
                        bg.IsGenreBased,
                        Bookshelves = bg.Bookshelves.Select(bs => new { bs.Id, bs.Name, bs.IsGenreBased }).ToList()
                    }).ToList(),
                    SelectedShelf = shelf,
                    SelectedGrouping = grouping,
                    ShowRecentOnly = recent,
                    UseCustomMappings = useCustomMappings,
                    BookReviews = bookReviews.Select(br => new
                    {
                        Id = br.Id,
                        Title = br.Title,
                        AuthorFirstName = br.AuthorFirstName,
                        AuthorLastName = br.AuthorLastName,
                        TitleByAuthor = br.TitleByAuthor,
                        MyRating = br.MyRating,
                        AverageRating = br.AverageRating,
                        NumberOfPages = br.NumberOfPages,
                        OriginalPublicationYear = br.OriginalPublicationYear,
                        DateRead = br.DateRead,
                        MyReview = br.MyReview,
                        SearchableString = br.SearchableString,
                        HasReviewContent = br.HasReviewContent,
                        PreviewText = br.PreviewText,
                        ReadingTimeMinutes = br.ReadingTimeMinutes,
                        CoverImageId = br.CoverImageId,
                        Bookshelves = br.Bookshelves.Select(bs => new { bs.Id, bs.Name, bs.IsGenreBased }).ToList(),
                        Tones = br.Tones.Select(t => new { t.Id, t.Name, t.Description }).ToList()
                    }).ToList()
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book reviews");
                return StatusCode(500, "An error occurred while fetching book reviews");
            }
        }
        
        private async Task<IActionResult> GetBookReviewSearchResults(string? displayCategory, string? shelf, string? grouping, bool recent, string searchTerm)
        {
            try
            {
                var results = await _bookReviewSearchService.SearchBooksAsync(searchTerm);
                
                var searchResults = results.Select(br => new
                {
                    Id = br.Id,
                    Title = br.Title,
                    AuthorFirstName = br.AuthorFirstName,
                    AuthorLastName = br.AuthorLastName,
                    TitleByAuthor = br.TitleByAuthor,
                    MyRating = br.MyRating,
                    AverageRating = br.AverageRating,
                    NumberOfPages = br.NumberOfPages,
                    OriginalPublicationYear = br.OriginalPublicationYear,
                    DateRead = br.DateRead,
                    MyReview = br.MyReview,
                    SearchableString = br.SearchableString,
                    HasReviewContent = br.HasReviewContent,
                    PreviewText = br.PreviewText,
                    ReadingTimeMinutes = br.ReadingTimeMinutes,
                    CoverImageId = br.CoverImageId,
                    Bookshelves = br.Bookshelves.Select(bs => new { bs.Id, bs.Name, bs.DisplayName, bs.IsGenreBased }).ToList(),
                    Tones = br.Tones.Select(t => new { t.Id, t.Name, t.Description }).ToList()
                }).ToList();
                
                // Get all bookshelves and groupings for the response
                var allBookshelves = await _context.Bookshelves
                    .OrderBy(bs => bs.DisplayName ?? bs.Name)
                    .ToListAsync();
                    
                var allBookshelfGroupings = await _context.BookshelfGroupings
                    .Include(bg => bg.Bookshelves)
                    .OrderBy(bg => bg.DisplayName ?? bg.Name)
                    .ToListAsync();
                
                var result = new
                {
                    Category = displayCategory,
                    AllBookshelves = allBookshelves.Select(bs => new { bs.Id, bs.Name, bs.IsGenreBased }).ToList(),
                    AllBookshelfGroupings = allBookshelfGroupings.Select(bg => new 
                    { 
                        bg.Id, 
                        bg.Name,
                        bg.IsGenreBased,
                        Bookshelves = bg.Bookshelves.Select(bs => new { bs.Id, bs.Name, bs.IsGenreBased }).ToList()
                    }).ToList(),
                    SelectedShelf = shelf,
                    SelectedGrouping = grouping,
                    ShowRecentOnly = recent,
                    UseCustomMappings = false, // Always false for search results
                    BookReviews = searchResults
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books with term: {searchTerm}", searchTerm);
                return StatusCode(500, "An error occurred while searching books");
            }
        }
    }
} 