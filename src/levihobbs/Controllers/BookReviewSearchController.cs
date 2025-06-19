using levihobbs.Services;
using Microsoft.AspNetCore.Mvc;

namespace levihobbs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookReviewSearchController : ControllerBase
    {
        private readonly ILogger<BookReviewSearchController> _logger;
        private readonly IBookReviewSearchService _bookReviewSearchService;
        
        public BookReviewSearchController(
            ILogger<BookReviewSearchController> logger,
            IBookReviewSearchService bookReviewSearchService)
        {
            _logger = logger;
            _bookReviewSearchService = bookReviewSearchService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetBookReviewSearchResults(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return BadRequest("Search term is required");
            }

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
                    Bookshelves = br.Bookshelves.Select(bs => new { bs.Id, bs.Name, bs.DisplayName }).ToList()
                }).ToList();
                
                return Ok(searchResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching books with term: {searchTerm}", searchTerm);
                return StatusCode(500, "An error occurred while searching books");
            }
        }
    }
} 