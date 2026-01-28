using Microsoft.AspNetCore.Mvc;
using levihobbs.Utils;
using levihobbs.Services;
using Microsoft.Extensions.Logging;
using BookDataApi.Shared.Dtos;

namespace levihobbs.Controllers
{
    public class BookReviewsController : Controller
    {
        private readonly ILogger<BookReviewsController> _logger;
        private readonly IBookDataApiService _bookDataApiService;
        
        public BookReviewsController(ILogger<BookReviewsController> logger, IBookDataApiService bookDataApiService)
        {
            _logger = logger;
            _bookDataApiService = bookDataApiService;
        }
        
        public IActionResult Index()
        {
            try
            {
                _logger.LogInformation("Attempting to load React app paths");
                
                // Get the dynamically generated script and CSS paths
                var scriptPath = ReactAppHelper.GetReactAppScriptPath("book-reviews-app");
                var cssPath = ReactAppHelper.GetReactAppCssPath("book-reviews-app");
                
                _logger.LogInformation("React app paths loaded - Script: {ScriptPath}, CSS: {CssPath}", scriptPath, cssPath);
                
                ViewBag.ScriptPath = scriptPath;
                ViewBag.CssPath = cssPath;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading React app paths");
                
                ViewBag.ScriptPath = string.Empty;
                ViewBag.CssPath = string.Empty;
                ViewBag.Error = "React app not built. Using mock data.";
            }
            
            return View();
        }
        
        [HttpGet]
        [Route("api/bookreviews")]
        public async Task<IActionResult> GetBookReviews([FromQuery] string? shelf, [FromQuery] string? grouping, [FromQuery] string? searchTerm)
        {
            try
            {
                List<BookReviewDto> bookReviews = await _bookDataApiService.GetBookReviewsAsync(
                    displayCategory: null,
                    shelf: shelf,
                    grouping: grouping,
                    recent: false
                );
                
                // Log book reviews count
                _logger.LogInformation("BookReviews count: {Count}", bookReviews.Count);
                
                // TODO: Implement search filtering once we know the exact property names on BookReviewDto
                // Filter by search term if provided
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    _logger.LogWarning("Search filtering is not yet implemented for BookReviewDto");
                    // For now, return all results when search term is provided
                    // This should be implemented once we know the DTO structure
                }
                
                // Get bookshelf configuration which contains bookshelves and groupings
                BookshelfConfigurationDto bookshelfConfig = await _bookDataApiService.GetBookshelfConfigurationAsync();
                
                // Log bookshelves count and first item details
                List<BookshelfDisplayItemDto> bookshelves = bookshelfConfig.Bookshelves?.ToList() ?? new List<BookshelfDisplayItemDto>();
                _logger.LogInformation("Bookshelves count: {Count}", bookshelves.Count);
                if (bookshelves.Any())
                {
                    BookshelfDisplayItemDto firstBookshelf = bookshelves.First();
                    _logger.LogInformation("First Bookshelf - Id: {Id}, Name: {Name}", firstBookshelf.Id, firstBookshelf.Name);
                }
                
                // Log bookshelf groupings count and first item details
                List<object> bookshelfGroupings = new List<object>(); // Empty for now since property doesn't exist
                _logger.LogInformation("BookshelfGroupings count: {Count}", bookshelfGroupings.Count);
                
                // Return the complete BookReviewsViewModel structure
                object result = new
                {
                    category = (string?)null,
                    allBookshelves = bookshelfConfig.Bookshelves?.ToList() ?? new List<BookshelfDisplayItemDto>(),
                    allBookshelfGroupings = new List<object>(), // Empty for now since property doesn't exist
                    selectedShelf = shelf,
                    selectedGrouping = grouping,
                    showRecentOnly = false,
                    useCustomMappings = false,
                    bookReviews = bookReviews
                };
                
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book reviews from API");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }
} 