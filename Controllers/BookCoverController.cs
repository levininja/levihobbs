using System;
using System.Threading.Tasks;
using levihobbs.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace levihobbs.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookCoverController : ControllerBase
    {
        private readonly ILogger<BookCoverController> _logger;
        private readonly IBookCoverService _bookCoverService;
        
        public BookCoverController(
            ILogger<BookCoverController> logger,
            IBookCoverService bookCoverService)
        {
            _logger = logger;
            _bookCoverService = bookCoverService;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetBookCover(string title, string author)
        {
            if (string.IsNullOrEmpty(title) || string.IsNullOrEmpty(author))
            {
                _logger.LogWarning("Missing title or author in book cover request");
                return BadRequest("Title and author are required");
            }

            try
            {
                var imageData = await _bookCoverService.GetBookCoverImageAsync(title, author);
                if (imageData == null)
                {
                    return NotFound();
                }

                return File(imageData, "image/jpeg");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting book cover for {Title} by {Author}", title, author);
                return StatusCode(500, "An error occurred while fetching the book cover");
            }
        }
    }
}